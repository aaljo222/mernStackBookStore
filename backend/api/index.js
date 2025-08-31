const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS 허용 판별 함수
function isAllowed(origin) {
  if (!origin) return true; // Postman, curl 등
  try {
    const u = new URL(origin);
    // 로컬
    if (u.origin === "http://localhost:5173") return true;
    // 프로덕션 고정 도메인(있다면)
    if (u.origin === "https://mern-book-frontend-roan.vercel.app") return true;
    // ✅ 동일 프로젝트의 Vercel 프리뷰 전부 허용
    if (
      u.hostname.startsWith("mern-book-frontend-") &&
      u.hostname.endsWith(".vercel.app")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowed(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
// 프리플라이트 처리
app.options("*", cors(corsOptions));

// 헬스체크
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// backend/api/index.js 내부
safeMount("/api/auth", "src/users/user.route.js");
safeMount("/api/books", "src/books/book.route.js");
safeMount("/api/orders", "src/orders/order.route.js");
safeMount("/api/admin", "src/stats/admin.stats.js");

// Vercel serverless 핸들러
module.exports = (req, res) => app(req, res);
