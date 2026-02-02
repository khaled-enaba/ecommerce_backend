const express = require("express");
const {
    getSalesReport,
    getProductStats,
    getUserStats,
    getOrderStats,
    getDashboardOverview,
    getOrdersByStatus,
    getSalesTrends,
    getStockAlerts,
    getPendingOrders,
    getPendingReviews,
    getUnreadMessages
} = require("../controller/report.controller");
const { getTopProducts, getLowStockProducts } = require("../controller/product-dashboard.controller");
const { getOrdersByStatusBreakdown, getDashboardPendingOrders } = require("../controller/order-dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const router = express.Router();

// All report routes require admin authentication
router.get("/sales",  getSalesReport);
router.get("/products",  getProductStats);
router.get("/users",  getUserStats);
router.get("/orders",  getOrderStats);
router.get("/overview",  getDashboardOverview);

// Dashboard-specific routes
router.get("/orders-by-status",  getOrdersByStatus);
router.get("/sales-trends",  getSalesTrends);
router.get("/stock-alerts",  getStockAlerts);
router.get("/orders/pending",  getPendingOrders);
router.get("/reviews/pending",  getPendingReviews);
router.get("/messages/unread",  getUnreadMessages);

// Product dashboard routes
router.get("/product/top-products",  getTopProducts);
router.get("/product/low-stock",  getLowStockProducts);
router.get("/order/status-breakdown",  getOrdersByStatusBreakdown);

module.exports = router;
