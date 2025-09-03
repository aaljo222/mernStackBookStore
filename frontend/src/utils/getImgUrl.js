// src/utils/getImgUrl.js
const API_BASE = import.meta.env.VITE_API_URL || "/api";

// 기본 placeholder
const FALLBACK = "https://via.placeholder.com/300x420.png?text=No+Image";

export function getImgUrl(src) {
  if (!src || typeof src !== "string") return FALLBACK;

  // 절대 URL은 그대로 사용
  if (/^https?:\/\//i.test(src)) return src;

  // 업로드 파일 경로 케이스 예시
  // DB에 "/uploads/xxx.jpg" 같은 값이 들어오는 경우
  if (src.startsWith("/uploads/")) return `${API_BASE}${src}`;

  // 그 외엔 assets/images 폴더에 있는 파일명이라고 가정
  return `/assets/images/${src}`;
}
