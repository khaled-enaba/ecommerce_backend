const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: { type: String, enum: ["home", "office"], default: "home" },

    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String }, // Optional phone number for this address

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
