// backend/api/index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connect } = require("../src/lib/db");
const mongoose = require("mongoose");
const { JWT_SECRET } = require("../src/utils/env"); // 존재 여부 검증용

connect().catch(() => {}); // 콜드스타트 연결 시도(실패해도 라우트에서 재시도)

const app = express();
app.disable("X-Powered-By");
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// 로컬 개발만 CORS 허용(배포는 same-origin이라 불필요)
const corsDelegate = (req, cb) => {
  const origin = req.header("Origin");
  cb(null, {
    origin: !origin || origin === "http://localhost:5173",
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  });
};
app.use(cors(corsDelegate));
app.options("*", cors(corsDelegate));

// ✅ 헬스체크
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health/db", async (_req, res, next) => {
  try {
    await connect();
    res.json({ ok: true, state: mongoose.connection.readyState }); // 1/2 = 연결됨
  } catch (e) {
    next(e);
  }
});

// ✅ 실제 API (여기엔 /api 프리픽스 붙이지 마세요)
app.use("/auth", require("../src/users/user.route"));
app.use("/books", require("../src/books/book.route"));
app.use("/orders", require("../src/orders/order.route"));
app.use("/admin", require("../src/stats/admin.stats"));

// 404
app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

// ✅ 에러 핸들러(500 원인 확인용)
app.use((err, _req, res, _next) => {
  console.error("🚨 Unhandled error:", err);
  res.status(err.status || 500).json({
    error: "INTERNAL",
    message: err.message,
  });
});

module.exports = app;
