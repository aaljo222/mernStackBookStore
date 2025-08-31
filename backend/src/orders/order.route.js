const router = require("express").Router();
const Order = require("../models/Order");
const { requireAuth, requireRole } = require("../middlewares/auth");

// 주문 생성(로그인 필요)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, phone, address, productIds, totalPrice } = req.body || {};
    if (!name || !totalPrice)
      return res.status(400).json({ error: "missing_fields" });

    const order = await Order.create({
      user: req.user.id,
      email: req.user.email,
      name,
      phone,
      address,
      productIds: Array.isArray(productIds) ? productIds : [],
      totalPrice,
    });
    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "create_order_failed" });
  }
});

// 내 주문
router.get("/mine", requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// 전체 주문(관리자)
router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
