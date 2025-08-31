const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const cors = require("cors");
console.log("server는 들어오는가 1)");
app.use(
  cors({
    origin: [
      /^http:\/\/localhost(:\d+)?$/, // 로컬
      /^https:\/\/.*vercel\.app$/, // Vercel 프리뷰/프로덕션 전부
      // 또는 정확히 지정하려면:
      // 'https://mern-book-frontend-roan.vercel.app',
      // 'https://mern-book-frontend-<preview>.vercel.app',
    ],
    credentials: true,
  })
);

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectMongo() {
  if (cached.conn) return cached.conn;
  let url = process.env.DB_URL;
  console.log("url:", url);
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.DB_URL, { dbName: "bookstore" })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

app.use(async (_req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (e) {
    console.error("Mongo connect error:", e);
    return res.status(500).json({ error: "db_connect_failed" });
  }
});

// 헬스체크
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 마지막
module.exports = (req, res) => app(req, res);

app.use(async (_req, _res, next) => {
  await ensureMongo();
  next();
});

// 📦 라우트
const path = require("path");
app.use("/api/books", require(path.join(__dirname, "../src/books/book.route")));
app.use(
  "/api/orders",
  require(path.join(__dirname, "../src/orders/order.route"))
);
app.use("/api/auth", require(path.join(__dirname, "../src/users/user.route")));
app.use(
  "/api/admin",
  require(path.join(__dirname, "../src/stats/admin.stats"))
);

// 헬스체크
app.get("/api/health", (_req, res) => res.send("ok"));

// api/index.js (마지막 줄)
module.exports = (req, res) => app(req, res); // ✅
