const Cart = require("../models/cart.model");
const Order = require("../models/order.model");

exports.createOrder = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate("items.productId");

  if (!cart || cart.items.length === 0)
    return res.status(400).json({ message: "Cart is empty" });

  const items = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    
    product.stock -= item.quantity;
    product.soldCount += item.quantity;
    await product.save();

    items.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: item.storedPrice,
      image: product.image?.[0]
    });

    totalAmount += item.storedPrice * item.quantity;
  }

  const order = await Order.create({
    orderNumber: `ORD-${Date.now()}`,
    user: req.user._id,
    items,
    totalAmount,
    shippingAddress: req.body.shippingAddress
  });

  await Cart.deleteOne({ userId: req.user._id });

  res.status(201).json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email mobile")
    .sort({ createdAt: -1 });
  res.json(orders);
};

exports.cancelOrder = async (req, res) => {
  const query = req.user.role === 'ADMIN'
    ? { _id: req.params.orderId }
    : { _id: req.params.orderId, user: req.user._id };

  const order = await Order.findOne(query);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === 'cancelled') return res.status(400).json({ message: "Order already cancelled" });

  if (order.status !== 'pending') {
    return res.status(400).json({ message: `Cannot cancel ${order.status} order` });
  }

  try {
    const Product = require("../models/product.model");
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity }
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling order", error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  await order.save();

  res.json(order);
};

exports.returnOrder = async (req, res) => {
  const query = { _id: req.params.orderId, user: req.user._id };
  const { reason } = req.body;
  const order = await Order.findOne(query);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== 'received') {
    return res.status(400).json({ message: `Cannot return order with status: ${order.status}` });
  }

  try {
    order.status = "return-requested";
    order.returnReason = reason;
    await order.save();

    res.json({ message: "Return request submitted successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Error submitting return request", error: err.message });
  }
};

exports.handleReturnRequest = async (req, res) => {
  const { orderId } = req.params;
  const { status, response } = req.body; 

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== 'return-requested') {
      return res.status(400).json({ message: "Order is not in return requested state" });
    }

    if (status === 'returned') {
      // Approve: Restock items
      const Product = require("../models/product.model");
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity }
        });
      }
    } else if (status === 'return-rejected') {
     
    } else {
      return res.status(400).json({ message: "Invalid status for return handling" });
    }

    order.status = status;
    order.returnAdminResponse = response;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error handling return request", error: err.message });
  }
};
