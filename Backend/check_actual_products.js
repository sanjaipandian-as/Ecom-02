import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ is_deleted: { $ne: true } });
        console.log('All products:');
        products.forEach(p => {
            console.log(`- ${p.name}`);
            console.log(`  Main Category: ${p.category?.main} (slug: ${p.category?.main_slug})`);
            console.log(`  Sub Category: ${p.category?.sub} (slug: ${p.category?.sub_slug})`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
