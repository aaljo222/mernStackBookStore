const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connect } = require("../src/lib/db");

connect()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connect error:", err));

const app = express();
app.disable("X-Powered-By");
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// 배포는 same-origin이므로 CORS 불필요. (로컬 개발만 허용)
const corsDelegate = (req, cb) => {
  const origin = req.header("Origin");
  const allow = !origin || origin === "http://localhost:5173";
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

// ✅ 라우트 (여기엔 /api 붙이지 마세요)
app.get("/health", (_req, res) =>
  res.status(200).json({ ok: true, ts: Date.now() })
);
app.use("/auth", require("../src/users/user.route"));
app.use("/books", require("../src/books/book.route"));
app.use("/orders", require("../src/orders/order.route"));
app.use("/admin", require("../src/stats/admin.stats"));

app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));
module.exports = app;
