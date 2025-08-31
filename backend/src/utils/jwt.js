const jwt = require("jsonwebtoken");

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const verify = (token, secret) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secret, (e, decoded) =>
      e ? reject(e) : resolve(decoded)
    )
  );

module.exports = { signAccess, signRefresh, verify };
