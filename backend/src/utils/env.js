// backend/src/utils/env.js
function pick(name, ...aliases) {
  for (const k of [name, ...aliases]) {
    const v = process.env[k];
    if (v && v.trim() !== "") return v;
  }
  return null;
}
function required(name, ...aliases) {
  const v = pick(name, ...aliases);
  if (v) return v;
  throw new Error(`Missing env: ${name} (aliases: ${aliases.join(", ")})`);
}

const MONGODB_URI        = required("MONGODB_URI");
const JWT_SECRET         = required("JWT_SECRET", "JWT_SECRET_KEY");
const JWT_REFRESH_SECRET = pick("JWT_REFRESH_SECRET", "JWT_REFRESH_KEY"); // 옵션

module.exports = { MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET };
