const Order = require("../models/order.model");

/* ================= GET ORDERS BY STATUS BREAKDOWN ================= */
exports.getOrdersByStatusBreakdown = async (req, res) => {
    try {
        const pending = await Order.countDocuments({ status: 'pending' });
        const processing = await Order.countDocuments({ status: 'preparing' });
        const completed = await Order.countDocuments({ status: 'received' });
        const cancelled = await Order.countDocuments({ status: 'cancelled' });
        const received = await Order.countDocuments({ status: 'received' });
        const returned = await Order.countDocuments({ status: 'returned' });
        const returnRequested = await Order.countDocuments({ status: 'return-requested' });
        const returnRejected = await Order.countDocuments({ status: 'return-rejected' });


        res.json({
            data: {
                pending,
                processing,
                cancelled,
                received,
                returned,
                returnRejected
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= GET PENDING ORDERS FOR DASHBOARD ================= */
exports.getDashboardPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('orderNumber totalAmount items createdAt user status');

        res.json({
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
