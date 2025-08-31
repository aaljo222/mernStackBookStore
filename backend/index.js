// api/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// CORS (로컬 + 모든 vercel.app 프리뷰/프로덕션 허용)
app.use(
  cors({
    origin: [/^http:\/\/localhost(:\d+)?$/, /^https:\/\/.*\.vercel\.app$/],
    credentials: true,
  })
);

// ----- Mongo 연결 (서버리스 캐시) -----
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.DB_URL; // 반드시 DB 이름 포함 or 아래 dbName 사용
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.DB_NAME || "bookstore",
      })
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// 모든 요청 전에 DB 보장
app.use(async (_req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error("Mongo connect error:", err);
    res.status(500).json({ error: "db_connect_failed" });
  }
});

// 헬스체크
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 라우트 (api/index.js 기준으로 한 단계 위의 src/* 경로)
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

// 서버리스 핸들러 export (하단에 딱 한 번만)
module.exports = (req, res) => app(req, res);
