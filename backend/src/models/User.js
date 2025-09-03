// backend/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // 이메일은 소문자/trim하여 저장, 유니크 인덱스
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    // password는 기본적으로 select에서 제외해 응답에 노출되지 않도록
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    name: { type: String, trim: true, default: "" },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      // 응답에서 password 제거
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// 새로 저장하거나 password가 변경될 때만 해시
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// findOneAndUpdate로 비밀번호를 바꿀 때도 해시
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }
  next();
});

// 평문 비밀번호 비교
UserSchema.methods.comparePassword = function (plain) {
  // 주의: password가 select:false라면, 이 메서드를 쓰는 쿼리에서 .select('+password') 필요
  return bcrypt.compare(plain, this.password);
};

// 이미 컴파일된 모델이 있으면 재사용(서버리스/핫리로드 안전)
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
