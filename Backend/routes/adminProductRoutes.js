import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";
import { validateImages } from "../middleware/imageValidator.js";

import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProductsCount,
  toggleTopSellingProduct,
  toggleViralProduct,
  bulkInventoryUpdate,
} from "../controllers/adminProductController.js";

const router = express.Router();

// Bulk inventory update
router.post("/bulk-inventory", authenticate, isAdmin, bulkInventoryUpdate);

// Create product (with image upload + validation)
router.post("/", authenticate, isAdmin, upload.array("images", 8), validateImages, createProduct);

// Get all products
router.get("/", authenticate, isAdmin, getAllProducts);

// Get products count
router.get("/count", authenticate, isAdmin, getAllProductsCount);

// Get product by ID
router.get("/:productId", authenticate, isAdmin, getProductById);

// Toggle homepage top selling section
router.patch("/:productId/top-selling", authenticate, isAdmin, toggleTopSellingProduct);

// Toggle homepage viral section
router.patch("/:productId/viral", authenticate, isAdmin, toggleViralProduct);

// Update product (with optional image upload + validation)
router.put("/:productId", authenticate, isAdmin, upload.array("images", 8), validateImages, updateProduct);

// Delete product (soft delete)
router.delete("/:productId", authenticate, isAdmin, deleteProduct);

export default router;
