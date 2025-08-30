require("dotenv").config();                 // 로컬 개발에서만 영향, 배포엔 환경변수 사용
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

// 0) env 검사
if (!process.env.DB_URL) {
  console.error("Missing env: DB_URL");
  process.exit(1);
}

// 1) 미들웨어
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PREVIEW,
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  })
);

// 2) 헬스체크(항상 응답)
app.get("/", (_req, res) => res.send("Book Store Server is running!"));

// 3) 라우트
const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);

// 4) DB 연결
async function main() {
  await mongoose.connect(process.env.DB_URL);
}
main()
  .then(() => console.log("MongoDB connect successfully!"))
  .catch((err) => {
    console.error("MongoDB connect error:", err);
    process.exit(1);
  });

// 5) 에러 핸들러
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// 6) 리스닝 (Render 등 일반 Node 호스팅용)
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// (Vercel Serverless로 쓸 땐 module.exports = app; 형태로 내보내는 패턴을 사용)
