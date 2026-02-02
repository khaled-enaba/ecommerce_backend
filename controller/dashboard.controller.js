const Order = require("../models/order.model");
const Product = require("../models/product.model");

/* ================= DASHBOARD ================= */
exports.getOrdersByStatus = async (req, res) => {
    try {
        const pending = await Order.countDocuments({ status: 'pending' });
        const processing = await Order.countDocuments({ status: 'preparing' });
        const completed = await Order.countDocuments({ status: 'received' });
        const cancelled = await Order.countDocuments({ status: 'cancelled' });

        res.json({
            data: {
                pending,
                processing,
                completed,
                cancelled
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSalesTrends = async (req, res) => {
    try {
        const days = req.query.days || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const trends = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    sales: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            data: trends
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStockAlerts = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;

        const criticalProducts = await Product.find({
            isDeleted: false,
            stock: { $lt: 5, $gt: 0 }
        }).select('name stock price soldCount').limit(5);

        const warningProducts = await Product.find({
            isDeleted: false,
            stock: { $gte: 5, $lt: threshold }
        }).select('name stock price soldCount').limit(3);

        const alerts = [
            ...criticalProducts.map(p => ({
                id: p._id,
                productName: p.name,
                currentStock: p.stock,
                price: p.price,
                soldCount: p.soldCount,
                severity: 'critical'
            })),
            ...warningProducts.map(p => ({
                id: p._id,
                productName: p.name,
                currentStock: p.stock,
                price: p.price,
                soldCount: p.soldCount,
                severity: 'warning'
            }))
        ];

        res.json({
            data: alerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingOrders = async (req, res) => {
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

exports.getPendingReviews = async (req, res) => {
    try {
        const Review = require('../models/review.model');
        const reviews = await Review.find({ approved: false })
            .populate('userId', 'name email')
            .populate('productId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            data: reviews || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadMessages = async (req, res) => {
    try {
        res.json({
            data: []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
