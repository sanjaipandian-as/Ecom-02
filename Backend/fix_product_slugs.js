import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ is_deleted: { $ne: true } });
        for (const p of products) {
            console.log(`Product: ${p.name}`);
            console.log(`  Current Main Category: ${p.category?.main} (slug: ${p.category?.main_slug})`);
            
            if (p.category?.main) {
                p.category.main_slug = p.category.main
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            }
            if (p.category?.sub) {
                p.category.sub_slug = p.category.sub
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            } else {
                p.category.sub_slug = "";
            }
            
            p.markModified('category');
            await p.save();
            console.log(`  Updated Main Category: ${p.category?.main} (slug: ${p.category?.main_slug})`);
        }

        console.log('Finished fixing slugs.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
