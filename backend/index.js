const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ✅ 허용 도메인
const ALLOW_LIST = [
  "http://localhost:5173",
  "https://mern-book-frontend-roan.vercel.app", // 프로덕션 도메인
];

// ✅ CORS 옵션 (프리뷰 URL도 허용)
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // 서버-서버 호출 등 origin 없음 허용

    const isAllowed =
      ALLOW_LIST.includes(origin) ||
      /https:\/\/mern-book-frontend-.*\.vercel\.app$/.test(origin); // 프리뷰

    cb(null, isAllowed);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ CORS + 프리플라이트
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 🔗 Mongo 연결(1회만)
let mongoReady;
async function ensureMongo() {
  if (!mongoReady) mongoReady = mongoose.connect(process.env.DB_URL);\
  console.log("db 연결완료")
  return mongoReady;
}
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

// ▶️ Vercel serverless 핸들러 내보내기
module.exports = (req, res) => app(req, res);
