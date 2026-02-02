const { isValidEmail, isValidPassword, isValidName, isValidPhone } = require("../utils/validators");

// Validation middleware for register
exports.validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  // Validate name
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else {
    const nameValidation = isValidName(name);
    if (!nameValidation.valid) {
      errors.push({ field: "name", message: nameValidation.message });
    }
  }

  // Validate email
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password
  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else {
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      errors.push({ field: "password", message: passwordValidation.message });
    }
  }

  if (phone) {
    const phoneValidation = isValidPhone(phone);
    if (!phoneValidation.valid) {
      errors.push({ field: "phone", message: phoneValidation.message });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password
  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
};
