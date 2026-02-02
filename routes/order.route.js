const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { createOrder, getOrders, cancelOrder, updateOrderStatus, getAllOrders, returnOrder, handleReturnRequest } = require("../controller/order.controller");
const Order = require("../models/order.model");
const { getOrdersByStatusBreakdown, getDashboardPendingOrders } = require('../controller/order-dashboard.controller');

router.use(authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/all", authorize('ADMIN'), getAllOrders);
router.get("/dashboard/status-breakdown", authorize('ADMIN'), getOrdersByStatusBreakdown);
router.get("/dashboard/pending", authorize('ADMIN'), getDashboardPendingOrders);
router.get("/status-breakdown", authorize('ADMIN'), getOrdersByStatusBreakdown);
router.put("/:orderId/cancel", cancelOrder);
router.put("/:orderId/return", returnOrder);
router.put("/:orderId/handle-return", authorize('ADMIN'), handleReturnRequest);
router.put("/:orderId/status", updateOrderStatus);


module.exports = router;
