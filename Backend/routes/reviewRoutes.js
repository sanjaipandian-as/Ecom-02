import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
  canReviewProduct,
  voteReview
} from "../controllers/reviewController.js";
import { reviewLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// ⭐ Customer-only Review Routes
router.post("/add", authenticate, reviewLimiter, addReview);
router.get("/can-review/:productId", authenticate, canReviewProduct);
router.put("/update/:reviewId", authenticate, reviewLimiter, updateReview);
router.delete("/delete/:reviewId", authenticate, reviewLimiter, deleteReview);
router.post("/vote/:reviewId", authenticate, reviewLimiter, voteReview);

// ⭐ Public — anyone can view product reviews
router.get("/:productId", getProductReviews);

export default router;
