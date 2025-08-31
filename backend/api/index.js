// backend/api/index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- CORS allowlist ---
function isAllowed(origin) {
  if (!origin) return true; // Postman, curl 등
  try {
    const u = new URL(origin);
    if (u.origin === "http://localhost:5173") return true;
    if (u.origin === "https://mern-book-frontend-roan.vercel.app") return true; // 고정 도메인
    // 동일 프로젝트의 vercel 프리뷰 전부 허용
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
app.options("*", cors(corsOptions)); // preflight

// --- 헬스체크(가장 먼저) ---
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- 안전한 라우트 마운트 헬퍼 ---
const ROOT = path.join(__dirname, ".."); // api/.. => backend

function safeMount(mountPath, relToRoot) {
  try {
    const abs = path.resolve(ROOT, relToRoot);
    const file = fs.existsSync(abs)
      ? abs
      : fs.existsSync(abs + ".js")
      ? abs + ".js"
      : null;

    if (!file) {
      console.warn(`[mount-miss] ${mountPath} -> ${abs}(.js) not found`);
      // 라우트가 없더라도 서버는 살아있게 더미 404 핸들러
      app.use(mountPath, (_req, res) =>
        res.status(404).json({ error: "route_not_found", mountPath, relToRoot })
      );
      return;
    }

    console.log(`[mount] ${mountPath} -> ${file}`);
    app.use(mountPath, require(file));
  } catch (err) {
    console.error(`[mount-error] ${mountPath} (${relToRoot})`, err);
    app.use(mountPath, (_req, res) =>
      res.status(500).json({ error: "route_load_failed", mountPath, relToRoot })
    );
  }
}

// --- 실제 라우트 장착 (확장자 .js 명시 권장) ---
safeMount("/api/auth", "src/users/user.route.js");
safeMount("/api/books", "src/books/book.route.js");
safeMount("/api/orders", "src/orders/order.route.js");
safeMount("/api/admin", "src/stats/admin.stats.js");

// --- serverless handler ---
module.exports = (req, res) => app(req, res);
