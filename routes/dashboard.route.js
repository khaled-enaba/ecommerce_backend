const express = require("express");
const {
    getOrdersByStatus,
    getSalesTrends,
    getStockAlerts,
    getPendingOrders,
    getPendingReviews,
    getUnreadMessages
} = require("../controller/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const router = express.Router();

// Admin dashboard endpoints - require authentication
router.use(authenticate);

router.get("/orders-by-status", authorize('ADMIN'), getOrdersByStatus);
router.get("/sales-trends", authorize('ADMIN'), getSalesTrends);
router.get("/stock-alerts", authorize('ADMIN'), getStockAlerts);
router.get("/orders/pending", authorize('ADMIN'), getPendingOrders);
router.get("/reviews/pending", authorize('ADMIN'), getPendingReviews);
router.get("/messages/unread", authorize('ADMIN'), getUnreadMessages);

module.exports = router;
