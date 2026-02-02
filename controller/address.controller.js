const Address = require("../models/address.model");

exports.addAddress = async (req, res) => {
    const { type, addressLine, city, phone, isDefault } = req.body;

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
        await Address.updateMany(
            { userId: req.user._id },
            { isDefault: false }
        );
    }

    const address = await Address.create({
        userId: req.user._id,
        type,
        addressLine,
        city,
        phone,
        isDefault,
    });

    res.status(201).json({ message: "Address added", data: address });
};

exports.getAddresses = async (req, res) => {
    const addresses = await Address.find({
        userId: req.user._id,
        isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({ data: addresses });
};

exports.updateAddress = async (req, res) => {
    const { id } = req.params;
    const { type, addressLine, city, phone, isDefault } = req.body;

    // Verify address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    // If setting as default, unset all other defaults
    if (isDefault) {
        await Address.updateMany(
            { userId: req.user._id, _id: { $ne: id } },
            { isDefault: false }
        );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
        id,
        { type, addressLine, city, phone, isDefault },
        { new: true }
    );

    res.status(200).json({ message: "Address updated", data: updatedAddress });
};

exports.removeAddress = async (req, res) => {
    const { id } = req.params;

    // Verify address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    await Address.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({ message: "Address removed" });
};

exports.setDefaultAddress = async (req, res) => {
    const { id } = req.params;

    // Verify address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    // Unset all other defaults for this user
    await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
    );

    // Set this address as default
    const updatedAddress = await Address.findByIdAndUpdate(
        id,
        { isDefault: true },
        { new: true }
    );

    res.status(200).json({ message: "Default address updated", data: updatedAddress });
};
