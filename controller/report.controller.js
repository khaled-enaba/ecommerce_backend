const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");


/* ================= SALES REPORT ================= */
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const stats = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);

        const revenueByStatus = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
        ]);

        res.json({
            data: {
                totalRevenue: stats[0]?.totalRevenue || 0,
                totalOrders: stats[0]?.totalOrders || 0,
                revenueByStatus,
                orders
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= PRODUCT STATISTICS ================= */
exports.getProductStats = async (req, res) => {
    try {
        const bestSellers = await Product.find({ isDeleted: false })
            .sort({ soldCount: -1 })
            .limit(20)
            .select("name soldCount price stock");

        const lowStock = await Product.find({
            isDeleted: false,
            stock: { $lt: 10, $gt: 0 },
        }).select("name stock price");

        const outOfStock = await Product.countDocuments({ isDeleted: false, stock: 0 });
        const totalProducts = await Product.countDocuments({ isDeleted: false });

        res.json({
            data: {
                totalProducts,
                bestSellers,
                lowStock,
                outOfStock,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= USER STATISTICS ================= */
exports.getUserStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const totalUsers = await User.countDocuments({ isDeleted: false });

        const filter = { isDeleted: false };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const newUsersCount = await User.countDocuments(filter);
        const usersList = await User.find(filter).sort({ createdAt: -1 }).select("name email role createdAt");

        const usersByRole = await User.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({
            data: {
                totalUsers,
                newUsersCount,
                usersByRole,
                users: usersList 
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= ORDER STATISTICS ================= */
exports.getOrderStats = async (req, res) => {
    try {
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user", "name email")
            .select("orderNumber totalAmount status createdAt user");

        const totalOrders = await Order.countDocuments();

        res.json({
            data: {
                totalOrders,
                ordersByStatus,
                recentOrders,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= DASHBOARD OVERVIEW ================= */
exports.getDashboardOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isDeleted: false });
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalOrders = await Order.countDocuments();

        const revenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        res.json({
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenueResult[0]?.totalRevenue || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/* ================= DASHBOARD - ORDERS BY STATUS ================= */
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

/* ================= DASHBOARD - SALES TRENDS ================= */
exports.getSalesTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
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
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DASHBOARD - STOCK ALERTS ================= */
exports.getStockAlerts = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;

        const criticalProducts = await Product.find({
            isDeleted: false,
            stock: { $lt: 5 } 
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
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DASHBOARD - PENDING ORDERS ================= */
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

/* ================= DASHBOARD - PENDING REVIEWS ================= */
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

/* ================= DASHBOARD - UNREAD MESSAGES ================= */
exports.getUnreadMessages = async (req, res) => {
    try {
        res.json({
            data: []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrdersByStatus = async (req, res) => {
    try {
        const pending = await Order.countDocuments({ status: 'pending' });
        const processing = await Order.countDocuments({ status: 'preparing' });
        const completed = await Order.countDocuments({ status: 'received' });
        const cancelled = await Order.countDocuments({ status: 'cancelled' });
        res.json({
            data: { pending, processing, completed, cancelled }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= 1. اتجاهات المبيعات (Sales Trends) ================= */
exports.getSalesTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
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
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
                    sales: { $sum: '$totalAmount' }, 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: trends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= 2. تنبيهات المخزون (Stock Alerts) ================= */
exports.getStockAlerts = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;

        const criticalProducts = await Product.find({ 
            isDeleted: false, 
            stock: { $lt: 5 } 
        })
        .select('name stock price soldCount')
        .sort({ stock: 1 }) 
        .limit(5);

        const warningProducts = await Product.find({ 
            isDeleted: false, 
            stock: { $gte: 5, $lt: threshold } 
        })
        .select('name stock price soldCount')
        .limit(3);

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

        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10).select('orderNumber totalAmount items createdAt user status');
        res.json({ data: orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPendingReviews = async (req, res) => {
    try {
        const Review = require('../models/review.model');
        const reviews = await Review.find({ approved: false }).populate('userId', 'name email').populate('productId', 'name').sort({ createdAt: -1 }).limit(5);
        res.json({ data: reviews || [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUnreadMessages = async (req, res) => {
    try {
        res.json({ data: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
