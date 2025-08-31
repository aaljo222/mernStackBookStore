const router = require("express").Router();
const cookieParser = require("cookie-parser");
const User = require("../models/User"); // 경로 유의: api/index.js에서 ROOT를 backend/src로 잡았다면 "../models/User"
const { signAccess, signRefresh, verify } = require("../utils/jwt");

router.use(cookieParser());

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "missing_fields" });

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
    console.error(e);
    res.status(500).json({ error: "register_failed" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "invalid_credentials" });

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
    console.error(e);
    res.status(500).json({ error: "login_failed" });
  }
});

// 관리자 로그인(간단 버전: 환경변수와 비교)
router.post("/admin", async (req, res) => {
  const { username, password } = req.body || {};
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = signAccess({
      id: "admin",
      email: "admin@local",
      role: "admin",
    });
    return res.json({ token });
  }
  return res.status(401).json({ error: "invalid_credentials" });
});

// 액세스 재발급
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh;
  if (!token) return res.status(401).json({ error: "no_refresh" });
  try {
    const decoded = await verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ error: "invalid_refresh" });

    const accessToken = signAccess({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "invalid_refresh" });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  res.clearCookie("refresh", { path: "/" });
  res.json({ ok: true });
});

module.exports = router;
