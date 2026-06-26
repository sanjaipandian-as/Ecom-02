import express from "express";
import { searchProducts, searchSuggestions } from "../controllers/searchController.js";
import { searchLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/", searchLimiter, searchProducts);           // ?q=Crackers
router.get("/suggest", searchLimiter, searchSuggestions); // ?q=Cr

export default router;
