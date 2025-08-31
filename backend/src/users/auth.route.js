const router = require("express").Router();
const User = require("../../models/User");
const { signAccess, signRefresh, verify } = require("../../utils/jwt");

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "missing_fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "email_exists" });

    const user = await User.create({ email, password, name });
    const access = signAccess({ id: user._id, email, role: user.role });
    const refresh = signRefresh({ id: user._id });
    // httpOnly 쿠키에 refresh 저장 (권장)
    res.cookie("refresh", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken: access,
      user: { id: user._id, email, name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: "register_failed" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: "invalid_credentials" });

  const access = signAccess({ id: user._id, email, role: user.role });
  const refresh = signRefresh({ id: user._id });
  res.cookie("refresh", refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    accessToken: access,
    user: { id: user._id, email, name: user.name, role: user.role },
  });
});

// 토큰 재발급
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh;
  if (!token) return res.status(401).json({ error: "no_refresh" });
  try {
    const decoded = await verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ error: "invalid_refresh" });
    const access = signAccess({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({ accessToken: access });
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
