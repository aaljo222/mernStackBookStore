// backend/api/index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { connect } = require("../src/lib/db");
const { JWT_SECRET } = require("../src/utils/env"); // 필수 env 검증 (없으면 여기서 throw)

// 콜드스타트 시 1회 연결 시도(실패해도 요청 시 재시도)
connect().catch(() => {});

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// ---------- CORS ----------
const ALLOWLIST = new Set([
  "http://localhost:5173",
  "https://mern-stack-book-store-one.vercel.app", // prod
]);
function isAllowed(origin) {
  if (!origin) return true; // same-origin 또는 서버 내부 호출
  try {
    const u = new URL(origin);
    if (ALLOWLIST.has(u.origin)) return true;
    // vercel preview 도메인 허용
    if (u.hostname.endsWith(".vercel.app")) return true;
  } catch {}
  return false;
}
app.use(
  cors({
    origin: (origin, cb) => cb(null, isAllowed(origin)),
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());

// ---------- '/api' 프리픽스 제거(프론트는 /api로 호출) ----------
app.use((req, _res, next) => {
  if (req.url === "/api") req.url = "/";
  else if (req.url.startsWith("/api/")) req.url = req.url.slice(4);
  next();
});

// ---------- Health ----------
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health/db", async (_req, res, next) => {
  try {
    await connect();
    res.json({ ok: true, state: mongoose.connection.readyState }); // 1/2 연결됨
  } catch (e) {
    next(e);
  }
});

// ---------- API ----------
app.use("/auth", require("../src/users/user.route"));
app.use("/books", require("../src/books/book.route"));
app.use("/orders", require("../src/orders/order.route"));
app.use("/admin", require("../src/stats/admin.stats"));

// 404
app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

// 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error("🚨 Unhandled error:", err);
  res.status(err.status || 500).json({
    error: "INTERNAL",
    message: err.message || "internal_error",
  });
});

 module.exports = async (req, res) => {
  try {
   await connect();           // 콜드스타트에서 1회 실제 연결
   return app(req, res);      // express 핸들링
 } catch (e) {
    console.error("DB connect error:", e);
    res.status(500).json({ error: "db_connect_failed", message: e.message });
 }
 };

