const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    author: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    description: { type: String, default: "" },

    // 프론트(cart)에서 newPrice를 사용하므로 필수
    oldPrice: { type: Number, default: 0 },
    newPrice: { type: Number, required: true },

    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Book || mongoose.model("Book", BookSchema);
