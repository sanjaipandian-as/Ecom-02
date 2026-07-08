import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function testSync() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get customer & generate token
    const customer = await Customer.findOne({});
    if (!customer) throw new Error("No customer");
    
    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    // Get 2 products
    const products = await Product.find({ is_deleted: { $ne: true } }).limit(2);
    
    // Clear cart first
    const Cart = mongoose.model('Cart');
    await Cart.findOneAndUpdate({ customerId: customer._id }, { items: [] }, { upsert: true });

    // Mock localCart
    const localCart = [
        { productId: products[0]._id.toString(), quantity: 1 },
        { productId: products[1]._id.toString(), quantity: 2 }
    ];

    console.log("Sending items:", localCart);

    try {
        const res = await axios.post('http://localhost:8000/api/cart/sync', { items: localCart }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Sync response:", res.data);
    } catch (e) {
        console.error("Sync error:", e.response?.data || e.message);
    }
    
    process.exit();
}

testSync();
