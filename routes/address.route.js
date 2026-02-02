const express = require("express");
const {
    addAddress,
    getAddresses,
    updateAddress,
    removeAddress,
    setDefaultAddress,
} = require("../controller/address.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const router = express.Router();

// All address routes require authentication
router.post("/", authenticate, addAddress);
router.get("/", authenticate, getAddresses);
router.put("/:id/default", authenticate, setDefaultAddress);
router.put("/:id", authenticate, updateAddress);
router.delete("/:id", authenticate, removeAddress);

module.exports = router;
