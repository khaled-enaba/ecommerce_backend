const Order = require("../models/order.model");
const Product = require("../models/product.model");

exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // find order by id
    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "RECEIVED") {
        return res.status(400).json({ message: "Order already received" });
    }

    order.status = status;
    await order.save();

    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { soldCount: item.quantity },
        });
    }
    
    if (status === "RECEIVED") {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { soldCount: item.quantity },
            });
        }
    }

    res.json(order);
};