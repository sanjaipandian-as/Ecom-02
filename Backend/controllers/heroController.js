import HeroSlide from '../models/HeroSlide.js';
import { storage } from '../services/storage/index.js';

// ==========================================
// 1. GET ALL SLIDES (Public - Optimized)
// ==========================================
export const getHeroSlides = async (req, res) => {
    try {
        // Return all fields for the slide and populate product data if exists
        const slides = await HeroSlide.find()
            .populate('product', 'name pricing averageRating totalReviews images description category')
            .sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            slides
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hero slides",
            error: err.message
        });
    }
};

// ==========================================
// 2. CREATE SLIDE (Admin - Image Only)
// ==========================================
export const createHeroSlide = async (req, res) => {
    try {
        const { 
            order,
            title,
            subtitle,
            desc,
            price,
            badge,
            ctaText,
            ctaLink,
            product
        } = req.body;

        // ─── Image Handling via StorageService ───
        let imageRelativePath = "";
        if (req.file) {
            const { relativePath } = await storage.store(req.file.path, 'hero');
            imageRelativePath = relativePath;
        } else if (req.body.image) {
            // Direct URL/path passed in body (e.g. from seed scripts)
            imageRelativePath = req.body.image;
        } else {
            return res.status(400).json({ message: "Image is required" });
        }

        const newSlide = new HeroSlide({
            image: imageRelativePath,
            order: order ? Number(order) : 0,
            title,
            subtitle,
            desc,
            price,
            badge,
            ctaText,
            ctaLink,
            product: product || null
        });

        await newSlide.save();

        res.status(201).json({
            success: true,
            message: "Hero slide created successfully",
            slide: newSlide
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create hero slide",
            error: err.message
        });
    }
};

// ==========================================
// 3. UPDATE SLIDE (Admin - Image Only)
// ==========================================
export const updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            order,
            title,
            subtitle,
            desc,
            price,
            badge,
            ctaText,
            ctaLink,
            product,
            image // specific case where simple URL string might be passed
        } = req.body;

        const slide = await HeroSlide.findById(id);
        if (!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }

        // Snapshot old image path for cleanup
        const oldImagePath = slide.image;

        if (order !== undefined) slide.order = Number(order);
        if (title !== undefined) slide.title = title;
        if (subtitle !== undefined) slide.subtitle = subtitle;
        if (desc !== undefined) slide.desc = desc;
        if (price !== undefined) slide.price = price;
        if (badge !== undefined) slide.badge = badge;
        if (ctaText !== undefined) slide.ctaText = ctaText;
        if (ctaLink !== undefined) slide.ctaLink = ctaLink;
        if (product !== undefined) slide.product = product || null;

        // ─── Image update via StorageService ───
        let imageChanged = false;
        if (req.file) {
            const { relativePath } = await storage.store(req.file.path, 'hero');
            slide.image = relativePath;
            imageChanged = true;
        } else if (image) {
            slide.image = image;
            imageChanged = (image !== oldImagePath);
        }

        await slide.save();

        // ─── Cleanup: delete old image if it was replaced ───
        if (imageChanged && oldImagePath && oldImagePath !== slide.image) {
            storage.delete(oldImagePath).catch(err => {
                console.error('[Hero Update] Failed to clean up old image:', err.message);
            });
        }

        res.status(200).json({
            success: true,
            message: "Hero slide updated successfully",
            slide
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update hero slide",
            error: err.message
        });
    }
};

// ==========================================
// 4. DELETE SLIDE (Admin)
// ==========================================
export const deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await HeroSlide.findByIdAndDelete(id);

        if (!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }

        // ─── Cleanup: delete image file from disk ───
        if (slide.image) {
            storage.delete(slide.image).catch(err => {
                console.error('[Hero Delete] Failed to clean up image:', err.message);
            });
        }

        res.status(200).json({
            success: true,
            message: "Hero slide deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete hero slide",
            error: err.message
        });
    }
};
