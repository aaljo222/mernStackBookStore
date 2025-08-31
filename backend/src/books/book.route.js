const router = require("express").Router();
const Book = require("../models/Book");
const { requireAuth, requireRole } = require("../middlewares/auth");

// 목록
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const find = q ? { title: { $regex: q, $options: "i" } } : {};
  const books = await Book.find(find).sort({ createdAt: -1 });
  res.json(books);
});

// 상세
router.get("/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: "not_found" });
  res.json(book);
});

// 생성(관리자)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const created = await Book.create(req.body || {});
  res.status(201).json(created);
});

// 수정(관리자)
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const updated = await Book.findByIdAndUpdate(req.params.id, req.body || {}, {
    new: true,
  });
  if (!updated) return res.status(404).json({ error: "not_found" });
  res.json(updated);
});

// 삭제(관리자)
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const removed = await Book.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

module.exports = router;
