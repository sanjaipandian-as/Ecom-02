import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const ankletsCategory = {
    name: "Anklets",
    icon: "https://images.unsplash.com/photo-1590548784585-645d2b09e072?auto=format&fit=crop&q=80&w=800",
    displayOrder: 6,
    isActive: true
};

const ankletsProducts = [
    {
        name: "Silver Beaded Heart Anklet",
        description: "A delicate sterling silver anklet featuring tiny polished silver beads and a charming heart pendant. Perfect for adding a touch of romance to your everyday look.",
        brand: "Minimalist Charm",
        pricing: { mrp: 4500, selling_price: 2999 },
        stock: 25,
        images: [
            "https://images.unsplash.com/photo-1590548784585-645d2b09e072?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?auto=format&fit=crop&q=80&w=800"
        ],
        tags: ["anklets", "silver", "beads", "heart", "everyday"],
        is_featured: true,
        specifications: [
            { key: "Material", value: "925 Sterling Silver" },
            { key: "Gemstone", value: "None" },
            { key: "Length", value: "9 inches + 1 inch extension" },
            { key: "Closure", value: "Lobster Claw" }
        ]
    },
    {
        name: "18k Gold Plated Double Chain Anklet",
        description: "Add a touch of layering with this double strand anklet. Crafted in 18k yellow gold-plated sterling silver, it features one classic cable chain and one textured satellite chain.",
        brand: "Solid Gold Co.",
        pricing: { mrp: 6000, selling_price: 3999 },
        stock: 20,
        images: [
            "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800"
        ],
        tags: ["anklets", "gold", "double-chain", "layering", "boho"],
        is_featured: false,
        specifications: [
            { key: "Material", value: "18k Yellow Gold Plated Sterling Silver" },
            { key: "Style", value: "Double Layer Cable & Satellite" },
            { key: "Length", value: "8.5 inches + 1.5 inch extension" },
            { key: "Clasp", value: "Spring Ring" }
        ]
    },
    {
        name: "Lustrous Pearl Drop Anklet",
        description: "This elegant anklet showcases three natural freshwater pearls suspended gracefully from a fine rose gold chain, adding a sophisticated shimmer to your ankle.",
        brand: "Aura Fine Jewelry",
        pricing: { mrp: 8500, selling_price: 5499 },
        stock: 15,
        images: [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
        ],
        tags: ["anklets", "rose-gold", "pearl", "freshwater", "luxury"],
        is_featured: true,
        specifications: [
            { key: "Material", value: "14k Rose Gold Plated Silver" },
            { key: "Gemstone", value: "Freshwater Pearls" },
            { key: "Pearl Size", value: "5mm" },
            { key: "Length", value: "9 inches + 1 inch extension" }
        ]
    },
    {
        name: "Emerald Eternity Evil Eye Anklet",
        description: "Keep bad vibes away with this stunning evil eye anklet, featuring a vibrant cushion-cut emerald center surrounded by micro-pave diamonds.",
        brand: "Luxe Gems",
        pricing: { mrp: 12000, selling_price: 7999 },
        stock: 10,
        images: [
            "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800"
        ],
        tags: ["anklets", "evil-eye", "emerald", "protection", "diamonds"],
        is_featured: true,
        specifications: [
            { key: "Material", value: "18k Yellow Gold Plated Sterling Silver" },
            { key: "Gemstone", value: "Natural Emerald & Cubic Zirconia" },
            { key: "Charm Size", value: "8mm" },
            { key: "Length", value: "9.5 inches" }
        ]
    },
    {
        name: "Boho Turquoise Charm Anklet",
        description: "An ultimate summer essential, this boho-inspired anklet features round turquoise beads and tiny silver shells dangling along a durable cable chain.",
        brand: "Minimalist Charm",
        pricing: { mrp: 3500, selling_price: 1999 },
        stock: 30,
        images: [
            "https://images.unsplash.com/photo-1590548784585-645d2b09e072?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?auto=format&fit=crop&q=80&w=800"
        ],
        tags: ["anklets", "turquoise", "boho", "shell", "summer"],
        is_featured: false,
        specifications: [
            { key: "Material", value: "925 Sterling Silver" },
            { key: "Gemstone", value: "Turquoise" },
            { key: "Design", value: "Beaded with Shell Charms" },
            { key: "Length", value: "9 inches + 1.5 inch extension" }
        ]
    }
];

const seedAnklets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if Anklets category already exists
        let catDoc = await Category.findOne({ name: ankletsCategory.name });
        if (!catDoc) {
            console.log('📂 Anklets category not found. Creating it...');
            catDoc = await Category.create(ankletsCategory);
            console.log(`✅ Category "${catDoc.name}" created! ID: ${catDoc._id}`);
        } else {
            console.log(`ℹ️  Category "${catDoc.name}" already exists. ID: ${catDoc._id}`);
            // Ensure it is active
            if (!catDoc.isActive) {
                catDoc.isActive = true;
                await catDoc.save();
                console.log(`✅ Category "${catDoc.name}" marked as active!`);
            }
        }

        for (const product of ankletsProducts) {
            const existingProduct = await Product.findOne({ name: product.name, is_deleted: false });
            if (existingProduct) {
                console.log(`⚠️  Product "${product.name}" already exists in the database. Skipping...`);
                continue;
            }

            const productData = {
                ...product,
                category: {
                    main: catDoc.name,
                    main_slug: catDoc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }
            };

            const newProduct = new Product(productData);
            await newProduct.save();
            console.log(`   + Seeded product: "${product.name}"`);
        }

        console.log('\n🎉 Seeding of Anklets category and products complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding anklets:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedAnklets();
