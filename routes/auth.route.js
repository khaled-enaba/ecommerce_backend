const express = require("express");
const { register, login } = require("../controller/auth.controller");
const { validateRegister, validateLogin } = require("../middlewares/validators.middleware");

const router = express.Router();

// routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
