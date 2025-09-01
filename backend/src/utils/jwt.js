// backend/src/utils/jwt.js
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_SECRET;

if (!ACCESS_SECRET) throw new Error("JWT access secret is not set");
if (!REFRESH_SECRET)
  console.warn(
    "⚠️ Using ACCESS secret as REFRESH secret (set JWT_REFRESH_SECRET!)"
  );

const signAccess = (payload, opts = { expiresIn: "15m" }) =>
  jwt.sign(payload, ACCESS_SECRET, opts);
const signRefresh = (payload, opts = { expiresIn: "7d" }) =>
  jwt.sign(payload, REFRESH_SECRET, opts);
const verify = (token, secret = ACCESS_SECRET) => jwt.verify(token, secret);

module.exports = {
  signAccess,
  signRefresh,
  verify,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
