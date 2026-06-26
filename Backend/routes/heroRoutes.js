import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";
import { validateImages } from "../middleware/imageValidator.js";
import {
    getHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide
} from "../controllers/heroController.js";

const router = express.Router();

// Public route to get all slides
router.get("/", getHeroSlides);

// Admin routes
router.post("/", authenticate, isAdmin, upload.single("image"), validateImages, createHeroSlide);
router.put("/:id", authenticate, isAdmin, upload.single("image"), validateImages, updateHeroSlide);
router.delete("/:id", authenticate, isAdmin, deleteHeroSlide);

export default router;
