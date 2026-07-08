import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const createTestProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test product already exists
    const existing = await Product.findOne({ sku: 'TEST-PAYMENT-001' });
    if (existing) {
      console.log('⚠️  Test product already exists:');
      console.log(`   ID: ${existing._id}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Price: ₹${existing.pricing.selling_price}`);
      console.log(`   Stock: ${existing.stock}`);
      process.exit(0);
    }

    const testProduct = await Product.create({
      name: 'Payment Gateway Test Product',
      description: 'This is a ₹1 dummy product created to test the live Razorpay payment gateway. Do NOT sell this to real customers. Delete after testing.',
      brand: 'Test',
      category: {
        main: 'Skin Care',
        main_slug: 'skin-care',
        sub: '',
        sub_slug: '',
      },
      pricing: {
        mrp: 1,
        cost: 0,
        selling_price: 1,
        discount_percentage: 0,
      },
      images: [
        'https://via.placeholder.com/500x500.png?text=TEST+PRODUCT+1',
        'https://via.placeholder.com/500x500.png?text=TEST+PRODUCT+2',
      ],
      sku: 'TEST-PAYMENT-001',
      stock: 999,
      low_stock_threshold: 1,
      tax_class: 'exempt',
      tags: ['test', 'payment-test', 'dummy'],
      is_deleted: false,
      is_featured: false,
      is_new_arrival: false,
    });

    console.log('\n🎉 Test product created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`   ID:      ${testProduct._id}`);
    console.log(`   Name:    ${testProduct.name}`);
    console.log(`   SKU:     ${testProduct.sku}`);
    console.log(`   Slug:    ${testProduct.slug}`);
    console.log(`   MRP:     ₹${testProduct.pricing.mrp}`);
    console.log(`   Price:   ₹${testProduct.pricing.selling_price}`);
    console.log(`   Stock:   ${testProduct.stock}`);
    console.log(`   Tax:     ${testProduct.tax_class}`);
    console.log('─────────────────────────────────────');
    console.log('\n💡 You can now search for this product on the website and test a ₹1 payment.');
    console.log('💡 After testing, delete it from the admin panel or run:');
    console.log(`   db.products.deleteOne({ sku: "TEST-PAYMENT-001" })`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test product:', error.message);
    process.exit(1);
  }
};

createTestProduct();
