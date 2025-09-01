// src/lib/db.js
const mongoose = require("mongoose");

const MONGODB_URI = process.env.DB_URL; // ← Vercel/로컬 .env 에서 주입
const MONGODB_DB = process.env.MONGODB_DB || "mern_bookstore"; // 선택

if (!MONGODB_URI) {
  throw new Error("Missing env: MONGODB_URI");
}

// Serverless에서 연결 재사용을 위한 전역 캐시
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        // bufferCommands: false, // 필요시
        // maxPoolSize: 5,        // 필요시
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
