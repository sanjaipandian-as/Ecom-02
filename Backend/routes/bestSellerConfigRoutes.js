import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    getBestSellerConfig,
    updateBestSellerConfig,
    resetBestSellerConfig,
} from '../controllers/bestSellerConfigController.js';

const router = express.Router();

// Public — frontend fetches this to populate tabs
router.get('/', getBestSellerConfig);

// Admin only — update the 4 category tabs
router.put('/', authenticate, isAdmin, updateBestSellerConfig);

// Admin only — reset to defaults
router.post('/reset', authenticate, isAdmin, resetBestSellerConfig);

export default router;
