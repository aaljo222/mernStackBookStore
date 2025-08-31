const mongoose = require("mongoose");
const { Schema } = mongoose;

const AddressSchema = new Schema({
  city: String,
  country: String,
  state: String,
  zipcode: String,
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }, // 로그인 유저
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    address: AddressSchema,

    // 프론트에서 productIds: cartItems.map(item => item?._id) 로 전달하므로
    productIds: [{ type: Schema.Types.Mixed }],

    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
