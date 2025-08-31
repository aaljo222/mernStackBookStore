const { verify } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no_token" });
  try {
    const decoded = await verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role)
      return res.status(403).json({ error: "forbidden" });
    next();
  };
}

module.exports = { requireAuth, requireRole };
