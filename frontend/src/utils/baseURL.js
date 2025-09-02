// frontend/src/utils/baseURL.ts
export default function getBaseUrl() {
  const isProd = typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
  return isProd ? "/api" : "http://localhost:3000"; // dev 서버 포트 맞추기
}
