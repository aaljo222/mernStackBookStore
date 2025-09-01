const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connect } = require("../src/lib/db");

// DB 연결 (콜드스타트 1회)
connect()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connect error:", err));

const app = express();
app.disable("X-Powered-By");
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

/** 같은 도메인(프론트와 백엔드가 한 프로젝트)이면
 *  프런트에서 /api 상대경로만 쓰면 CORS가 필요 없습니다.
 *  로컬 개발용으로만 CORS를 허용하고, 배포에선 생략해도 됩니다.
 */
const ALLOW_LOCAL = "http://localhost:5173";
const corsDelegate = (req, cb) => {
  const origin = req.header("Origin");
  const allow = !origin || origin === ALLOW_LOCAL; // 배포는 same-origin이므로 필요 X
  cb(null, {
    origin: allow,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  });
};
app.use(cors(corsDelegate));
app.options("*", cors(corsDelegate));

// Health
app.get("/health", (_req, res) =>
  res.status(200).json({ ok: true, ts: Date.now() })
);

// 라우트 (여기엔 /api 붙이지 마세요!)
app.use("/auth", require("../src/users/user.route"));
app.use("/books", require("../src/books/book.route"));
app.use("/orders", require("../src/orders/order.route"));
app.use("/admin", require("../src/stats/admin.stats"));

app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

// Vercel용 export
module.exports = app;
