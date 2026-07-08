import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Let's filter by mainCategory = 'face-wash'
        const mainCategory = 'face-wash';
        const query = { is_deleted: { $ne: true } };
        query["category.main_slug"] = mainCategory;

        const products = await Product.find(query);
        console.log(`Products for mainCategory '${mainCategory}':`, products.length);
        products.forEach(p => console.log(`- ${p.name}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
