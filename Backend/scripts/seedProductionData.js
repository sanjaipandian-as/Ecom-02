import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const realProducts = [
  {
    name: "Pure Botanical Face Serum",
    description: "Concentrated serums designed to target specific skin concerns. Formulated with 100% organic botanical extracts, Vitamin C, and Retinol to provide deep hydration and visible radiance.",
    brand: "Plenora Organic",
    sku: "PLN-FS-001",
    category: { main: "Face Care", sub: "Serums" },
    pricing: { mrp: 1499, cost: 450, selling_price: 899 },
    stock: 150,
    low_stock_threshold: 20,
    shipping: { weight: 100, dimensions: { length: 5, width: 5, height: 12 } },
    tax_class: "standard",
    hsn_code: "33049910",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    showInTopSelling: true
  },
  {
    name: "Hydrating Rosewater Mist",
    description: "Pure steam-distilled rosewater from fresh Damask roses. Instantly hydrates, tones, and refreshes the skin. Alcohol-free and 100% natural.",
    brand: "Plenora Organic",
    sku: "PLN-TM-002",
    category: { main: "Face Care", sub: "Toners" },
    pricing: { mrp: 699, cost: 150, selling_price: 499 },
    stock: 300,
    low_stock_threshold: 50,
    shipping: { weight: 250, dimensions: { length: 6, width: 6, height: 15 } },
    tax_class: "standard",
    hsn_code: "33049910",
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: false,
    showInViral: true
  },
  {
    name: "Argan Oil Hair Mask",
    description: "Deep conditioning treatment enriched with cold-pressed Argan oil. Repairs damaged hair, reduces frizz, and adds intense shine and softness.",
    brand: "Plenora Organic",
    sku: "PLN-HM-003",
    category: { main: "Hair Care", sub: "Treatments" },
    pricing: { mrp: 1299, cost: 380, selling_price: 799 },
    stock: 120,
    low_stock_threshold: 15,
    shipping: { weight: 500, dimensions: { length: 10, width: 10, height: 8 } },
    tax_class: "standard",
    hsn_code: "33059040",
    images: [
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535585209827-a15fcdce4c2d?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    showInTopSelling: true
  },
  {
    name: "Vitamin C Body Lotion",
    description: "Brightening body lotion with stabilized Vitamin C and Shea Butter. Deeply nourishes skin while improving tone and texture.",
    brand: "Plenora Organic",
    sku: "PLN-BL-004",
    category: { main: "Body Care", sub: "Lotions" },
    pricing: { mrp: 899, cost: 220, selling_price: 599 },
    stock: 200,
    low_stock_threshold: 30,
    shipping: { weight: 400, dimensions: { length: 8, width: 8, height: 20 } },
    tax_class: "standard",
    hsn_code: "33049930",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: false,
    showInViral: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products (Careful in production!)
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const createdProducts = await Product.insertMany(realProducts);
    console.log(`Successfully seeded ${createdProducts.length} production-grade products.`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
