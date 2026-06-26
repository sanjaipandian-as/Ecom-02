import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/wishlistController.js";
import { cartWishlistLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Apply cartWishlistLimiter to all wishlist routes
router.use(cartWishlistLimiter);

// ⭐ Customer-only Wishlist Routes
router.post("/add", authenticate, addToWishlist);
router.delete("/remove/:productId", authenticate, removeFromWishlist);
router.get("/", authenticate, getWishlist);

export default router;
