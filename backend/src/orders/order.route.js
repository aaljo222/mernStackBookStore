// backend/src/orders/order.route.js
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

// ✅ 프런트에서 쓰는 "이메일로 주문 조회"
router.get("/email/:email", async (req, res) => {
  const { email } = req.params;
  const orders = await Order.find({ email }).sort({ createdAt: -1 });
  res.json(orders);
});

// 내 주문(토큰 기반)
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
