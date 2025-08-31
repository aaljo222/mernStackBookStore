const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// ---- CORS (프리뷰/프로덕션 프론트 모두 허용) ----
function isAllowed(origin) {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    if (u.origin === "http://localhost:5173") return true;
    if (u.origin === "https://mern-book-frontend-roan.vercel.app") return true; // 프로덕션
    if (u.hostname.startsWith("mern-book-frontend-") && u.hostname.endsWith(".vercel.app")) return true; // 프리뷰
    return false;
  } catch {
    return false;
  }
}
const corsOptions = {
  origin(origin, cb) => isAllowed(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// ---- Health 가장 위쪽에 ----
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ---- 라우터 마운트(backend 기준 상대경로) ----
app.use("/api/auth",   require("../src/users/user.route"));
app.use("/api/books",  require("../src/books/book.route"));
app.use("/api/orders", require("../src/orders/order.route"));
app.use("/api/admin",  require("../src/stats/admin.stats"));

// ---- Vercel 핸들러 ----
module.exports = (req, res) => app(req, res);
