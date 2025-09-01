// backend/src/lib/db.js
const mongoose = require("mongoose");

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not set");
}

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // serverless에서 권장
      })
      .then((m) => {
        console.log("✅ Mongo connected");
        return m;
      })
      .catch((e) => {
        console.error("❌ Mongo connect failed:", e);
        throw e;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
