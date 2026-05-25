import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const verifyJewelry = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const categories = await Category.find({}).sort({ displayOrder: 1 });
        console.log(`📂 Found ${categories.length} Categories in Database:\n`);

        let totalProducts = 0;

        for (const cat of categories) {
            const count = await Product.countDocuments({
                'category.main': cat.name,
                is_deleted: false
            });
            console.log(`📁 Category: ${cat.name} (Slug: ${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`);
            console.log(`   Product Count: ${count}`);
            
            const products = await Product.find({
                'category.main': cat.name,
                is_deleted: false
            }).sort({ name: 1 });

            products.forEach((p, idx) => {
                console.log(`   ${idx + 1}. ${p.name} - ₹${p.pricing.selling_price} (Stock: ${p.stock})`);
            });
            console.log('');
            totalProducts += count;
        }

        console.log(`📊 TOTAL: ${totalProducts} products across ${categories.length} categories.`);
        if (categories.length === 5 && totalProducts === 25) {
            console.log('🎉 Verification Successful! Database is perfectly configured.');
        } else {
            console.log('⚠️ Verification Warning: Category or product counts do not match expectation (5 categories, 25 products).');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        process.exit(1);
    }
};

verifyJewelry();
