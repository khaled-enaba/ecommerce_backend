/**
 * BACKEND IMPLEMENTATION GUIDE FOR DASHBOARD NOTIFICATIONS & CHARTS
 * 
 * This file outlines the API endpoints that need to be created in the backend
 * to support the enhanced dashboard features.
 */

// ============================================================================
// 1. REPORT ROUTES & CONTROLLER UPDATES
// ============================================================================
// File: routes/report.route.js

const express = require('express');
const router = express.Router();
const { 
  getDashboardOverview,
  getOrdersByStatus,
  getSalesTrends,
  getStockAlerts,
  getPendingOrders,
  getPendingReviews,
  getUnreadMessages
} = require('../controller/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/overview', getDashboardOverview);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/sales-trends', getSalesTrends);
router.get('/stock-alerts', getStockAlerts);
router.get('/orders/pending', getPendingOrders);
router.get('/reviews/pending', getPendingReviews);
router.get('/messages/unread', getUnreadMessages);

module.exports = router;


// ============================================================================
// 2. REPORT CONTROLLER IMPLEMENTATIONS
// ============================================================================
// File: controller/report.controller.js

const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');

// Get orders breakdown by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const pending = await Order.countDocuments({ status: 'pending' });
    const processing = await Order.countDocuments({ status: 'preparing' });
    const completed = await Order.countDocuments({ status: 'received' });
    const cancelled = await Order.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      message: 'Orders by status',
      data: {
        pending,
        processing,
        completed,
        cancelled
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sales trends for last N days
exports.getSalesTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'received'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      message: 'Sales trends',
      data: trends
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get low stock products (stock < 10)
exports.getStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const lowStockProducts = await Product.find({
      stock: { $lt: threshold },
      isDeleted: false,
      isActive: true
    })
    .select('name stock price categoryId')
    .limit(20);

    res.status(200).json({
      message: 'Low stock products',
      data: lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending orders
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: 'Pending orders',
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending reviews (awaiting approval)
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: false })
      .populate('productId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: 'Pending reviews',
      data: reviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread messages
exports.getUnreadMessages = async (req, res) => {
  try {
    // This requires a Message model. For now, return empty array
    // In future, implement a proper messaging system
    res.status(200).json({
      message: 'Unread messages',
      data: []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================================
// 3. PRODUCT ROUTES & CONTROLLER UPDATES
// ============================================================================
// File: routes/product.route.js - Add these endpoints:

router.get('/top-products', getTopProducts);
router.get('/low-stock', getLowStock);

// File: controller/product.controller.js - Add these methods:

exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const topProducts = await Product.find({
      isDeleted: false,
      isActive: true
    })
    .select('name soldCount price image')
    .sort({ soldCount: -1 })
    .limit(limit);

    res.status(200).json({
      message: 'Top products by sales',
      data: topProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const lowStockProducts = await Product.find({
      stock: { $lt: threshold },
      isDeleted: false,
      isActive: true
    })
    .select('name stock price image soldCount')
    .sort({ stock: 1 })
    .limit(20);

    res.status(200).json({
      message: 'Low stock products',
      data: lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================================
// 4. ORDER ROUTES & CONTROLLER UPDATES
// ============================================================================
// File: routes/order.route.js - Add this endpoint:

router.get('/status-breakdown', getOrderStatusBreakdown);
router.get('/pending', getPendingOrders);

// File: controller/order.controller.js - Add these methods:

exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const pending = await Order.countDocuments({ status: 'pending' });
    const preparing = await Order.countDocuments({ status: 'preparing' });
    const shipped = await Order.countDocuments({ status: 'shipped' });
    const received = await Order.countDocuments({ status: 'received' });
    const cancelled = await Order.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      message: 'Order status breakdown',
      data: {
        pending,
        processing: preparing,
        completed: received,
        cancelled,
        shipped
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: 'Pending orders',
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================================
// 5. DATABASE MODIFICATIONS NEEDED
// ============================================================================

// Review Model - Add 'approved' field:
// File: models/review.model.js
const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  comment: String,
  approved: { type: Boolean, default: false },  // ADD THIS
  createdAt: { type: Date, default: Date.now }
});

// Create Message Model:
// File: models/message.model.js
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  content: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

// Create Message Route:
// File: routes/message.route.js
router.get('/unread', getUnreadMessages);

exports.getUnreadMessages = async (req, res) => {
  try {
    const messages = await Message.find({ read: false })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      message: 'Unread messages',
      data: messages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================================
// 6. UPDATE app.js
// ============================================================================
// Add the new routes to the main app:

app.use('/api/message', require('./routes/message.route')); // Add this line
// The report, product, and order routes should already be there


// ============================================================================
// 7. TESTING GUIDE
// ============================================================================

/*
After implementing the above:

1. Test dashboard overview:
   GET /api/report/overview
   
2. Test orders by status:
   GET /api/report/orders-by-status
   
3. Test sales trends:
   GET /api/report/sales-trends?days=7
   
4. Test stock alerts:
   GET /api/report/stock-alerts
   GET /api/product/low-stock
   GET /api/product/top-products?limit=5
   
5. Test pending orders:
   GET /api/report/orders/pending
   GET /api/order/pending
   
6. Test pending reviews:
   GET /api/report/reviews/pending
   
7. Test messages:
   GET /api/message/unread

All endpoints require authentication (JWT token) and admin role.
*/
