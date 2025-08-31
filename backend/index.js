// api/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// CORS: 로컬 + vercel.app 전체 허용
app.use(
  cors({
    origin: [/^http:\/\/localhost(:\d+)?$/, /^https:\/\/.*\.vercel\.app$/],
    credentials: true,
  })
);

// ---- 1) DB 없이도 통과되는 핑/헬스 ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- 2) Mongo 연결 (서버리스 캐시) ----
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectMongo() {
  if (cached.conn) return cached.conn;

  // URL에 DB명이 포함돼 있지 않다면 DB_NAME 사용
  const uri = process.env.DB_URL; // 예: ...mongodb.net/bookstore?retryWrites=true&w=majority
  if (!uri) throw new Error("Missing DB_URL");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // URL에 /bookstore 로 DB명이 이미 있으면 생략 가능
        dbName: process.env.DB_NAME || "bookstore",
      })
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ---- 3) DB 연결 보장 미들웨어 (헬스 제외) ----
app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next(); // 이미 위에서 처리
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error("Mongo connect error:", err);
    res.status(500).json({ error: "db_connect_failed" });
  }
});

// ---- 4) 라우트 로드 (경로 정확히 맞추기!!) ----
// api/index.js 가 [repo 루트]/api/index.js 라면,
// 라우트가 [repo 루트]/src/... 에 있어야 아래 경로가 맞습니다.
try {
  app.use(
    "/api/books",
    require(path.join(__dirname, "..", "src", "books", "book.route"))
  );
  app.use(
    "/api/orders",
    require(path.join(__dirname, "..", "src", "orders", "order.route"))
  );
  app.use(
    "/api/auth",
    require(path.join(__dirname, "..", "src", "users", "user.route"))
  );
  app.use(
    "/api/admin",
    require(path.join(__dirname, "..", "src", "stats", "admin.stats"))
  );
} catch (e) {
  // 경로 또는 모듈 에러면 즉시 콘솔로 확인
  console.error("Route load error:", e);
}

// ---- 5) 서버리스 핸들러 export (단 한 번) ----
module.exports = (req, res) => app(req, res);
