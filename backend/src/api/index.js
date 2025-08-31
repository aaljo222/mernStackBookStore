// api/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [/^http:\/\/localhost(:\d+)?$/, /^https:\/\/.*\.vercel\.app$/],
    credentials: true,
  })
);

// --- Mongo (생략 가능) --- //
let cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });
async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const url = process.env.DB_URL;
    if (!url) throw new Error("Missing env DB_URL");
    cached.promise = mongoose
      .connect(url, { dbName: "bookstore" })
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
    res.status(500).json({ error: "db_connect_failed" });
  }
});

// --- 헬스체크 --- //
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ---- 라우트 장착 (backend 루트를 기준) ----
const ROOT = path.join(__dirname, ".."); // ← api/.. => backend

function mount(mountPath, relToRoot) {
  try {
    const abs = path.resolve(ROOT, relToRoot);
    const candidate = fs.existsSync(abs + ".js") ? abs + ".js" : abs;
    console.log(
      "[mount]",
      mountPath,
      "->",
      candidate,
      "exists?",
      fs.existsSync(candidate)
    );
    app.use(mountPath, require(candidate));
  } catch (e) {
    console.error("Route load error:", mountPath, relToRoot, e);
    app.get(mountPath, (_req, res) =>
      res.status(404).json({ error: "route_load_failed", mountPath, relToRoot })
    );
  }
}

// 실제 구조가 backend/src/* 라면 이 4줄만 사용
mount("/api/books", "src/books/book.route");
mount("/api/orders", "src/orders/order.route");
mount("/api/auth", "src/users/user.route");
mount("/api/admin", "src/stats/admin.stats");

// 마지막 한 줄만 export
module.exports = (req, res) => app(req, res);
