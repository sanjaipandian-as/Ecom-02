import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const order = await Order.findById('6a4cc1ad3500a3c9550e28e3').populate('items.productId');
        if (!order) {
            console.log('Order not found');
        } else {
            console.log('Order details:', JSON.stringify(order, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspect();
