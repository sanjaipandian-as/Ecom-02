import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cart from './models/Cart.js';
import Product from './models/Product.js';
import Customer from './models/Customer.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // 1. Get a customer
    const customer = await Customer.findOne({});
    if (!customer) {
        console.log("No customer found");
        process.exit();
    }
    const customerId = customer._id;
    console.log("Customer:", customer.email);

    // 2. Get two products
    const products = await Product.find({ is_deleted: { $ne: true } }).limit(2);
    if (products.length < 2) {
        console.log("Not enough products found");
        process.exit();
    }
    const productId1 = products[0]._id;
    const productId2 = products[1]._id;
    console.log("Product 1:", products[0].name);
    console.log("Product 2:", products[1].name);

    // 3. Simulate sync
    const items = [
        { productId: productId1.toString(), quantity: 1 },
        { productId: productId2.toString(), quantity: 2 }
    ];

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    } else {
      cart.items = []; // Clear for test
    }

    console.log("Cart before sync:", cart.items);

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity, 10);
      if (!productId || isNaN(qty) || qty < 1) continue;

      const p = await Product.findOne({ _id: productId, is_deleted: { $ne: true } });
      if (!p) {
        console.log("Product not found in DB during sync loop for ID:", productId);
        const anyP = await Product.findById(productId);
        console.log("Does it exist without is_deleted check?", !!anyP, "is_deleted value:", anyP.is_deleted, "type:", typeof anyP.is_deleted);
        continue;
      }

      const itemIndex = cart.items.findIndex(
        (i) => i.productId.toString() === productId
      );

      if (itemIndex >= 0) {
        const mergedQty = cart.items[itemIndex].quantity + qty;
        cart.items[itemIndex].quantity = Math.min(mergedQty, p.stock || 0);
      } else {
        cart.items.push({
          productId,
          quantity: Math.min(qty, p.stock || 0)
        });
      }
    }

    await cart.save();
    console.log("Cart after sync:", cart.items);

    // 4. Fetch cart as in getCart
    const populatedCart = await Cart.findOne({ customerId }).populate("items.productId");
    console.log("Populated cart items:");
    populatedCart.items.forEach(i => console.log(i.productId ? i.productId.name : "null"));

    process.exit();
  });
