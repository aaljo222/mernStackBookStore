const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://<YOUR-FRONT>.vercel.app"],
    credentials: true,
  })
);

// Mongo 연결 (1회만)
let mongoReady;
async function ensureMongo() {
  if (!mongoReady) {
    mongoReady = mongoose.connect(process.env.DB_URL);
  }
  return mongoReady;
}
app.use(async (_req, _res, next) => {
  await ensureMongo();
  next();
});

// 라우트
app.use("/api/books", require("../functions/src/books/book.route")); // 경로는 실제 위치대로
app.use("/api/orders", require("../functions/src/orders/order.route"));
app.use("/api/auth", require("../functions/src/users/user.route"));
app.use("/api/admin", require("../functions/src/stats/admin.stats"));

module.exports = app; // Vercel serverless는 default export가 app이면 OK
