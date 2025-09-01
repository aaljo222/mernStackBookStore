// backend/src/models/User.js (요약 예시)
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
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", schema);
