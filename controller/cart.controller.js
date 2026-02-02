const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate("items.productId", "name price image");

  if (!cart) return res.json({ items: [] });

  cart.items.forEach(item => {
    if (item.storedPrice !== item.productId.price) {
      item.priceChanged = true;
    }
  });

  await cart.save();
  res.json(cart);
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!quantity || quantity < 1)
    return res.status(400).json({ message: "Invalid quantity" });

  const product = await Product.findById(productId);
  if (!product || !product.isActive || product.isDeleted)
    return res.status(404).json({ message: "Product not available" });

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const item = cart.items.find(i => i.productId.equals(productId));

  if (item) item.quantity += quantity;
  else cart.items.push({
    productId,
    quantity,
    storedPrice: product.price
  });

  await cart.save();
  res.json(cart);
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(i => i.productId.equals(productId));
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
};

exports.removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  cart.items = cart.items.filter(
    i => !i.productId.equals(req.params.productId)
  );
  await cart.save();
  res.json(cart);
};
