// backend/src/middlewares/auth.js
const { verify } = require("../utils/jwt");
const { JWT_SECRET } = require("../utils/env"); // ← 한 곳에서 로드 (JWT_SECRET_KEY도 alias 처리 추천)

async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "no_token" });

    const decoded = await verify(token, JWT_SECRET);
    // decoded 예: { id, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_token", message: e.message });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
