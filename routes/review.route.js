const express = require("express");
const {
    addReview,
    getAllApprovedReviews,
    getUserReviews,
    approveReview,
    getAllReviews,
    deleteReview,
} = require("../controller/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const router = express.Router();

// Public routes (Get all approved site reviews)
router.get("/", getAllApprovedReviews);
router.get("/recent", getAllApprovedReviews);

// Authenticated user routes (Add review, get my reviews)
router.post("/", authenticate, addReview);
router.get("/my-reviews", authenticate, getUserReviews);

// Admin routes (Manage all reviews)
router.get("/admin", authenticate, authorize("ADMIN"), getAllReviews);
router.put("/:id/approve", authenticate, authorize("ADMIN"), approveReview);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteReview);

module.exports = router;
