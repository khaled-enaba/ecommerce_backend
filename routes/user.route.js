const express = require("express");
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    resetUserPassword,
    softDeleteUser,
    getLoggedUser,
    updateLoggedUser,
    changePassword,
} = require("../controller/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const router = express.Router();

// Profile routes (authenticated user)
router.get("/profile", authenticate, getLoggedUser);
router.put("/profile", authenticate, updateLoggedUser);
router.put("/change-password", authenticate, changePassword);
// Admin routes
router.get("/", authenticate, authorize("ADMIN"), getUsers);
router.post("/createuser", authenticate, authorize("ADMIN"), createUser("USER"));
router.post("/createadmin", authenticate, authorize("ADMIN"), createUser("ADMIN"));
router.get("/:id", authenticate, authorize("ADMIN"), getUserById);
router.put("/:id", authenticate, authorize("ADMIN"), updateUser);
router.put("/:id/reset-password", authenticate, authorize("ADMIN"), resetUserPassword);
router.delete("/:id", authenticate, authorize("ADMIN"), softDeleteUser);

module.exports = router;

