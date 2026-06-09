import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import HeroSlide from './models/HeroSlide.js';

dotenv.config();

const heroSlides = [
    { 
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&h=600&fit=crop", 
        title: "Glow Like Never Before",
        subtitle: "Viral Glow Kit",
        desc: "Our best-selling skin glow kit is back in stock. Achieve radiant skin in just 7 days with our natural formula.",
        price: "1299",
        badge: "BEST SELLER",
        ctaText: "Shop Glow Kit",
        ctaLink: "/category/viral-skin-glow-kit",
        order: 1 
    },
    { 
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&h=600&fit=crop", 
        title: "Pure Botanical Serums",
        subtitle: "100% Organic",
        desc: "Concentrated serums designed to target specific skin concerns. From Vitamin C to Retinol, we have it all.",
        price: "899",
        badge: "NEW ARRIVAL",
        ctaText: "Explore Serums",
        ctaLink: "/category/serums",
        order: 2 
    },
    { 
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&h=600&fit=crop", 
        title: "Daily Essential Care",
        subtitle: "Face & Body",
        desc: "Complete your daily routine with our range of cleansers, moisturizers, and sunscreens. Gentle on skin, tough on impurities.",
        price: "499",
        badge: "MUST HAVE",
        ctaText: "Shop Essentials",
        ctaLink: "/products",
        order: 3 
    }
];

const categories = [
    { name: "Viral skin glow kit", icon: "https://images.unsplash.com/photo-1570172619380-2126400a7474?w=800", showInTopbar: true },
    { name: "Viral skin whitening kit", icon: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800", showInTopbar: true },
    { name: "Best sellers", icon: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800", showInTopbar: true },
    { name: "Face wash", icon: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", showInTopbar: true },
    { name: "Serums", icon: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", showInTopbar: true },
    { name: "Sunscreen/ Moisture", icon: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800", showInTopbar: true },
    { name: "Face pack", icon: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", showInTopbar: true },
    { name: "Soaps", icon: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800", showInTopbar: true },
    { name: "Eye care", icon: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800", showInTopbar: true },
    { name: "Lip care", icon: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800", showInTopbar: true },
    { name: "Face cream", icon: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800", showInTopbar: true }
];

const generateProducts = (categoryName) => {
    const products = [];
    const imagesMap = {
        "Viral skin glow kit": "https://images.unsplash.com/photo-1570172619380-2126400a7474?w=400",
        "Viral skin whitening kit": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400",
        "Best sellers": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
        "Face wash": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
        "Serums": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        "Sunscreen/ Moisture": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        "Face pack": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
        "Soaps": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400",
        "Eye care": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400",
        "Lip care": "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
        "Face cream": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400"
    };

    const mainSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const imageUrl = imagesMap[categoryName] || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400";

    for (let i = 1; i <= 5; i++) {
        products.push({
            name: `${categoryName} Product ${i}`,
            description: `High-quality ${categoryName} designed for professional results. This product helps maintain healthy and glowing skin.`,
            brand: "Plenora",
            category: {
                main: categoryName,
                main_slug: mainSlug,
                sub: categoryName,
                sub_slug: mainSlug
            },
            pricing: {
                mrp: 999 + (i * 100),
                selling_price: 799 + (i * 100),
                discount_percentage: 20
            },
            stock: 100,
            images: [imageUrl, imageUrl], // Model requires 2-5 images
            tags: [categoryName.toLowerCase(), "skincare", "plenora"],
            is_featured: i === 1,
            specifications: [
                { key: "Weight", value: "50g" },
                { key: "Type", value: "Premium" }
            ]
        });
    }
    return products;
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        await HeroSlide.deleteMany({});
        console.log('Cleared existing categories, products, and hero slides');

        // Create Hero Slides
        await HeroSlide.insertMany(heroSlides);
        console.log('Created hero slides');

        // Create categories
        await Category.insertMany(categories);
        console.log('Created categories');

        // Create products
        let allProducts = [];
        for (const cat of categories) {
            const products = generateProducts(cat.name);
            allProducts = allProducts.concat(products);
        }

        await Product.insertMany(allProducts);
        console.log(`Successfully added ${allProducts.length} products`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
