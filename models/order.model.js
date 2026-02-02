const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  quantity: Number,
  price: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [orderItemSchema],
  totalAmount: Number,
  shippingAddress: {
    addressLine: String,
    city: String,
    phone: String
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "shipped", "received", "cancelled", "return-requested", "returned", "return-rejected"],
    default: "pending"
  },
  returnReason: String,
  returnAdminResponse: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
