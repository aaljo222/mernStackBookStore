// backend/src/lib/db.js
const mongoose = require("mongoose");
const { MONGODB_URI } = require("../utils/env");

// serverless 환경에서 연결 캐시
let _cached = global._mongoose;
if (!_cached) _cached = global._mongoose = { conn: null, promise: null };

async function connect() {
  if (_cached.conn) return _cached.conn;

  if (!_cached.promise) {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
    _cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 15000,
        // tls/ssl이 필요한 Atlas의 기본 URI면 옵션 없이도 연결됩니다.
      })
      .then((m) => m.connection);
  }

  _cached.conn = await _cached.promise;
  return _cached.conn;
}

module.exports = { connect };
