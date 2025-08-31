const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser()); // refresh 토큰 읽을 때 필요

// 프론트 실제 도메인만 화이트리스트로 허용
const allowlist = [
  "http://localhost:5173",
  // 프리뷰/프로덕션 vercel 프론트 도메인들 (정확한 값 추가)
  "https://mern-book-frontend-h4udn81t0-leejaeohs-projects-3147e6a4.vercel.app",
  "https://mern-book-frontend-roan.vercel.app",
];

// origin 검사 함수
function isAllowed(origin) {
  if (!origin) return true; // curl/Postman 등의 경우
  return allowlist.some((o) => o === origin);
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowed(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 프리플라이트 캐시
};

app.use(cors(corsOptions));
// 프리플라이트 직접 허용
app.options("*", cors(corsOptions));
