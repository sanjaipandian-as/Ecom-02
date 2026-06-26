import express from "express";
import upload from "../middleware/upload.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { authenticate } from "../middleware/auth.js";
import { validateImages } from "../middleware/imageValidator.js";

import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  isAdmin,
  upload.single("icon"),
  validateImages,
  addCategory
);

router.get("/", getCategories);

router.put(
  "/update/:categoryId",
  authenticate,
  isAdmin,
  upload.single("icon"),
  validateImages,
  updateCategory
);

router.delete(
  "/delete/:categoryId",
  authenticate,
  isAdmin,
  deleteCategory
);

export default router;
