const router = require("express").Router();
// const cookieParser = require("cookie-parser"); // 앱 레벨에서 이미 사용 중이면 불필요
const User = require("../models/User");
const {
  signAccess,
  signRefresh,
  verify,
  REFRESH_SECRET,
} = require("../utils/jwt");

// router.use(cookieParser());

// backend/src/users/user.route.js (register 부분만 보완)
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "missing_fields" });
    if (password.length < 8)
      return res.status(400).json({ error: "password_too_short" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "email_exists" });

    const user = await User.create({ email, password, name });

    const accessToken = signAccess({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refresh = signRefresh({ id: user._id });

    res.cookie("refresh", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("register_failed:", e);
    res.status(500).json({ error: "register_failed", message: e.message });
  }
});

// 로그인
// backend/src/users/user.route.js (login 부분만)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    // 레거시(평문)였다면 여기서 해시로 업그레이드
    if (!user.password.startsWith("$2")) {
      user.password = password; // pre('save')에서 해시됨
      await user.save();
    }

    const accessToken = signAccess({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refresh = signRefresh({ id: user._id });
    res.cookie("refresh", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("login_failed:", e);
    res.status(500).json({ error: "login_failed", message: e.message });
  }
});

// 액세스 재발급
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh;
  if (!token) return res.status(401).json({ error: "no_refresh" });
  try {
    const decoded = verify(token, REFRESH_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ error: "invalid_refresh" });

    const accessToken = signAccess({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({ accessToken });
  } catch (e) {
    console.error("refresh_failed:", e);
    res.status(401).json({ error: "invalid_refresh" });
  }
});

// 로그아웃 (삭제 옵션 일치시켜 주기)
router.post("/logout", (_req, res) => {
  res.clearCookie("refresh", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ ok: true });
});

module.exports = router;
