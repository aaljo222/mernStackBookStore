// backend/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: "user" },
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // 이미 bcrypt 해시 형태면 재해시 금지
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 평문으로 저장된 레거시도 통과시킬 수 있게
schema.methods.comparePassword = async function (plain) {
  const hash = this.password || "";
  if (hash.startsWith("$2")) {
    return bcrypt.compare(plain, hash);
  }
  // 레거시(평문) 패스워드인 경우
  return plain === hash;
};

module.exports = mongoose.model("User", schema);
