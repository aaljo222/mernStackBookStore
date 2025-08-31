const router = require("express").Router();
const Order = require("../models/Order");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middlewares/auth");

// 간단 요약 통계
router.get("/summary", requireAuth, requireRole("admin"), async (_req, res) => {
  const [users, orders] = await Promise.all([
    User.countDocuments(),
    Order.find().select("totalPrice createdAt").lean(),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  res.json({
    users,
    orders: orders.length,
    totalSales,
    recentOrders: orders.slice(-5).reverse(),
  });
});

module.exports = router;
