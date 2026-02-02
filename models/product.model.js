const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  image: [String],
  stock: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isSummer: { type: Boolean, default: true },
},
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
