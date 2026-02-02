const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
exports.logout = async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: "Logged out successfully" });
}


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // SELECT PASSWORD
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  //PASS BOTH ARGUMENTS
  const isMatch = await user.correctPassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user);

  return res.status(200).json({
    message: "Logged in",
    token,
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  const token = signToken(user);

  return res.status(201).json({
    message: "Registered",
    token,
  });
};
