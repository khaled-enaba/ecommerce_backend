const Product = require("../models/product.model");

/* ================= GET TOP PRODUCTS ================= */
exports.getTopProducts = async (req, res) => {
    try {
        const limit = req.query.limit || 5;

        const topProducts = await Product.find({ isDeleted: false })
            .sort({ soldCount: -1 })
            .limit(parseInt(limit))
            .select('name price soldCount stock image');

        res.json({
            data: topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= GET LOW STOCK PRODUCTS ================= */
exports.getLowStockProducts = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;

        const lowStockProducts = await Product.find({
            isDeleted: false,
            stock: { $lt: threshold, $gt: 0 }
        }).select('name price stock soldCount image').sort({ stock: 1 });

        res.json({
            data: lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
