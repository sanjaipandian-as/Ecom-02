import express from "express";
import { optionalAuthenticate } from "../middleware/auth.js";
import {
  getAllProducts,
  getProductById,
  searchProducts,
  filterByCategory,
  getPaginatedProducts,
  filterProducts,
  getFilterOptions,
  getProductsBySeller,
  getHomepageSections,
} from "../controllers/customerProductController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/homepage-sections", optionalAuthenticate, getHomepageSections);
router.get("/product/:productId", getProductById);
router.get("/search", searchProducts);
router.get("/filter", filterProducts);
router.get("/filter-options", getFilterOptions);
router.get("/category/:category", filterByCategory);
router.get("/page", getPaginatedProducts);
router.get("/seller/:sellerId", getProductsBySeller);

export default router;
