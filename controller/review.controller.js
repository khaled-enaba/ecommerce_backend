const Review = require("../models/review.model");

/* ================= ADD SITE REVIEW ================= */
exports.addReview = async (req, res) => {
    const { rating, comment } = req.body;

    if (!comment || !rating) {
        return res.status(400).json({ message: "Rating and comment are required" });
    }

    const review = await Review.create({
        userId: req.user._id,
        rating,
        comment,
        // isApproved defaults to false, requiring admin OK
    });
    res.status(201).json({ message: "Review submitted for approval", data: review });
};

/* ================= GET ALL APPROVED REVIEWS (PUBLIC) ================= */
exports.getAllApprovedReviews = async (req, res) => {
    const reviews = await Review.find({
        isApproved: true,
        isDeleted: false,
    })
        .populate("userId", "name")
        .sort({ createdAt: -1 });

    res.json({ data: reviews });
};

/* ================= GET USER REVIEWS ================= */
exports.getUserReviews = async (req, res) => {
    const reviews = await Review.find({
        userId: req.user._id,
        isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({ data: reviews });
};

/* ================= APPROVE REVIEW (ADMIN) ================= */
exports.approveReview = async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
    );

    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review approved", data: review });
};

/* ================= GET ALL REVIEWS (ADMIN) ================= */
exports.getAllReviews = async (req, res) => {
    const { approved } = req.query;

    const filter = { isDeleted: false };
    if (approved === "true") filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;

    const reviews = await Review.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

    res.json({ data: reviews });
};

/* ================= DELETE REVIEW (ADMIN) ================= */
exports.deleteReview = async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );

    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted" });
};
