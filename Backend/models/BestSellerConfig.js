import mongoose from 'mongoose';

/**
 * BestSellerConfig — stores the 4 admin-configurable category tabs
 * for the BestSellers section on the homepage.
 * 
 * Rules:
 *   - "All" is always slot 0 and is NOT stored here (it's always shown by the frontend).
 *   - Admin can set exactly 4 category names (slots 1–4).
 *   - Only one config doc exists (singleton, identified by key: "default").
 */
const bestSellerConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: 'default',
            unique: true,
        },
        // Exactly 4 admin-chosen category tab names
        categories: {
            type: [String],
            validate: {
                validator: (arr) => arr.length <= 4,
                message: 'You can only configure up to 4 categories.',
            },
            default: ['Face Care', 'Hair Care', 'Body Care', 'Lip Care'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('BestSellerConfig', bestSellerConfigSchema);
