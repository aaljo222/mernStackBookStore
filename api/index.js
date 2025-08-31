const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "mern-book-frontend-gh40vtoi9-leejaeohs-projects-3147e6a4.vercel.app",
    ],
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

app.use("/api/books", require("./src/books/book.route"));
app.use("/api/orders", require("./src/orders/order.route"));
app.use("/api/auth", require("./src/users/user.route"));
app.use("/api/admin", require("./src/stats/admin.stats"));

// 헬스체크
app.get("/api/health", (_req, res) => res.send("ok"));

module.exports = app; // ← Vercel serverless
