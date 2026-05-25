import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const testFilter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const categories = ["Rings", "Necklaces", "Earrings", "Bracelets", "Jewelry Sets"];
        
        console.log('Simulating Frontend queries with price range [0, 10000000]...\n');

        let grandTotal = 0;

        for (const cat of categories) {
            const query = {
                is_deleted: { $ne: true },
                "category.main": cat,
                "pricing.selling_price": { $gte: 0, $lte: 10000000 }
            };

            const products = await Product.find(query);
            console.log(`📁 Category: ${cat}`);
            console.log(`   Products found within price filter: ${products.length}`);
            products.forEach((p, idx) => {
                console.log(`   - ${p.name}: ₹${p.pricing.selling_price}`);
            });
            console.log('');
            grandTotal += products.length;
        }

        console.log(`📊 TOTAL Products returned by filter: ${grandTotal}`);
        if (grandTotal === 25) {
            console.log('🎉 API Verification Successful! All 25 products are now fully visible on category pages.');
        } else {
            console.log('⚠️ API Verification Warning: Product count is not 25.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testFilter();
