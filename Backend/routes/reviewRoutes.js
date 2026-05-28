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

const router = express.Router();

// ⭐ Customer-only Review Routes
router.post("/add", authenticate, addReview);
router.get("/can-review/:productId", authenticate, canReviewProduct);
router.put("/update/:reviewId", authenticate, updateReview);
router.delete("/delete/:reviewId", authenticate, deleteReview);
router.post("/vote/:reviewId", authenticate, voteReview);

// ⭐ Public — anyone can view product reviews
router.get("/:productId", getProductReviews);

export default router;
