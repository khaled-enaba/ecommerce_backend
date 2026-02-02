const User = require("../models/user.model");

exports.createUser = (role) => {
    return async (req, res) => {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password, role });
        res.status(201).json({ message: 'user created', data: user });
    }
}

exports.getUsers = async (req, res) => {
    const users = await User.find({ isDeleted: false });
    res.status(200).json({ message: 'list of all users', data: users });
}

exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ data: user });
}

exports.updateUser = async (req, res) => {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, isActive },
        { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: "user updated", data: user });
};

exports.softDeleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    res.status(200).json({ message: "user deleted", data: user });
};

exports.getLoggedUser = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({ data: user });
};

exports.updateLoggedUser = async (req, res, next) => {
    const { name, email, mobile } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email, mobile },
        { new: true }
    );
    res.status(200).json({ data: user });
};

exports.changePassword = async (req, res, next) => {
    const { currentPassword, password, passwordConfirm } = req.body;

    // 1) Get user and existing password
    const user = await User.findById(req.user._id).select("+password");

    // 2) Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return res.status(401).json({ message: "Incorrect current password" });
    }

    // 3) Update password
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
};

exports.resetUserPassword = async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    res.status(200).json({ message: "User password reset successfully" });
};
