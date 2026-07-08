import BestSellerConfig from '../models/BestSellerConfig.js';

/**
 * GET /api/admin/bestseller-config
 * Returns the current bestseller category configuration.
 * Public (customer-facing) — no auth required.
 */
export const getBestSellerConfig = async (req, res) => {
    try {
        let config = await BestSellerConfig.findOne({ key: 'default' });

        // Auto-create with defaults if not yet configured
        if (!config) {
            config = await BestSellerConfig.create({
                key: 'default',
                categories: ['Face Care', 'Hair Care', 'Body Care', 'Lip Care'],
            });
        }

        return res.status(200).json({
            // "All" is always the first tab — frontend reads this list and prepends it
            categories: config.categories,
        });
    } catch (error) {
        console.error('getBestSellerConfig error:', error);
        return res.status(500).json({ message: 'Failed to fetch bestseller config.' });
    }
};

/**
 * PUT /api/admin/bestseller-config
 * Admin updates the 4 category tabs.
 * Body: { categories: ["Face Care", "Hair Care", "Body Care", "Lip Care"] }
 */
export const updateBestSellerConfig = async (req, res) => {
    try {
        const { categories } = req.body;

        // Validation
        if (!Array.isArray(categories)) {
            return res.status(400).json({ message: 'categories must be an array.' });
        }
        
        // Clean and filter out empty categories
        const cleaned = categories.map((c) => String(c || '').trim()).filter(Boolean);
        
        if (cleaned.length > 4) {
            return res.status(400).json({
                message: 'A maximum of 4 categories can be configured.',
            });
        }

        const config = await BestSellerConfig.findOneAndUpdate(
            { key: 'default' },
            { $set: { categories: cleaned } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            message: 'Bestseller categories updated successfully.',
            categories: config.categories,
        });
    } catch (error) {
        console.error('updateBestSellerConfig error:', error);
        return res.status(500).json({ message: 'Failed to update bestseller config.' });
    }
};

/**
 * POST /api/admin/bestseller-config/reset
 * Resets to default categories.
 */
export const resetBestSellerConfig = async (req, res) => {
    try {
        const defaults = ['Face Care', 'Hair Care', 'Body Care', 'Lip Care'];

        const config = await BestSellerConfig.findOneAndUpdate(
            { key: 'default' },
            { $set: { categories: defaults } },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            message: 'Bestseller categories reset to defaults.',
            categories: config.categories,
        });
    } catch (error) {
        console.error('resetBestSellerConfig error:', error);
        return res.status(500).json({ message: 'Failed to reset bestseller config.' });
    }
};
