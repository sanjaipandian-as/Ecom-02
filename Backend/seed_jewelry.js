import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import HeroSlide from './models/HeroSlide.js';

dotenv.config();

const jewelryCategories = [
    {
        name: "Rings",
        icon: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
        displayOrder: 1
    },
    {
        name: "Necklaces",
        icon: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
        displayOrder: 2
    },
    {
        name: "Earrings",
        icon: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
        displayOrder: 3
    },
    {
        name: "Bracelets",
        icon: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        displayOrder: 4
    },
    {
        name: "Jewelry Sets",
        icon: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
        displayOrder: 5
    }
];

const jewelryProducts = {
    "Rings": [
        {
            name: "Classic Diamond Solitaire Ring",
            description: "A timeless 1-carat round brilliant diamond, set in an elegant 18k white gold band. A symbol of everlasting love and commitment.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 120000, selling_price: 95000 },
            stock: 15,
            images: [
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["rings", "engagement", "diamond", "white-gold", "luxury"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k White Gold" },
                { key: "Gemstone", value: "Diamond" },
                { key: "Diamond Weight", value: "1.0 Carat" },
                { key: "Cut", value: "Round Brilliant" },
                { key: "Ring Size", value: "US 7" }
            ]
        },
        {
            name: "Gold Eternity Band",
            description: "An elegant eternity band crafted in solid 18k yellow gold, featuring a continuous row of micro-pave diamonds.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 65000, selling_price: 52000 },
            stock: 25,
            images: [
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["rings", "band", "gold", "eternity", "diamonds"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Gemstone", value: "Diamonds" },
                { key: "Setting", value: "Micro-pave" },
                { key: "Band Width", value: "2mm" },
                { key: "Ring Size", value: "US 6" }
            ]
        },
        {
            name: "Emerald & Diamond Halo Ring",
            description: "A stunning cushion-cut natural emerald surrounded by a sparkling halo of diamonds, set in an 18k yellow gold band.",
            brand: "Luxe Gems",
            pricing: { mrp: 150000, selling_price: 135000 },
            stock: 10,
            images: [
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["rings", "emerald", "diamond", "halo", "luxury"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Center Gemstone", value: "Natural Emerald" },
                { key: "Accent Gemstone", value: "Diamonds" },
                { key: "Center Weight", value: "1.5 Carat" },
                { key: "Ring Size", value: "US 7" }
            ]
        },
        {
            name: "Sapphire Royal Statement Ring",
            description: "Inspired by royal designs, this ring features an oval-cut Ceylon blue sapphire cradled in a delicate diamond-encrusted platinum band.",
            brand: "Luxe Gems",
            pricing: { mrp: 180000, selling_price: 162000 },
            stock: 8,
            images: [
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["rings", "sapphire", "platinum", "statement", "royal"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "Platinum" },
                { key: "Center Gemstone", value: "Blue Sapphire" },
                { key: "Accent Gemstone", value: "Diamonds" },
                { key: "Sapphire Weight", value: "2.0 Carat" },
                { key: "Ring Size", value: "US 6.5" }
            ]
        },
        {
            name: "Rose Gold Stackable Ring Set",
            description: "A set of three stackable rings crafted in 14k rose gold, featuring smooth, twisted, and diamond-studded textures.",
            brand: "Minimalist Charm",
            pricing: { mrp: 35000, selling_price: 28000 },
            stock: 40,
            images: [
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["rings", "rose-gold", "stackable", "minimalist", "diamonds"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "14k Rose Gold" },
                { key: "Gemstone", value: "Diamonds" },
                { key: "Set Includes", value: "3 Rings" },
                { key: "Total Weight", value: "4.5g" },
                { key: "Ring Size", value: "US 7" }
            ]
        }
    ],
    "Necklaces": [
        {
            name: "Diamond Solitaire Pendant",
            description: "A brilliant 0.75-carat round diamond pendant hanging gracefully from an 18k white gold cable chain. Simply breathtaking.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 98000, selling_price: 79000 },
            stock: 12,
            images: [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["necklaces", "pendant", "diamond", "white-gold", "minimalist"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k White Gold" },
                { key: "Gemstone", value: "Diamond" },
                { key: "Diamond Weight", value: "0.75 Carat" },
                { key: "Chain Length", value: "18 inches" },
                { key: "Clasp Type", value: "Lobster Claw" }
            ]
        },
        {
            name: "Classic Pearl Strand Necklace",
            description: "A hand-knotted strand of lustrous Akoya pearls, finished with an elegant 18k yellow gold filigree clasp. A wardrobe staple.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 45000, selling_price: 36000 },
            stock: 20,
            images: [
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["necklaces", "pearl", "akoya", "classic", "premium"],
            is_featured: false,
            specifications: [
                { key: "Pearl Type", value: "Akoya Cultured" },
                { key: "Pearl Size", value: "7.5-8.0mm" },
                { key: "Length", value: "18 inches" },
                { key: "Clasp Material", value: "18k Yellow Gold" },
                { key: "Pearl Luster", value: "Very High" }
            ]
        },
        {
            name: "Gold Herringbone Chain",
            description: "A sleek and fluid herringbone chain made of solid 18k yellow gold, offering a high-polish shine that sits perfectly flat on the collarbone.",
            brand: "Solid Gold Co.",
            pricing: { mrp: 55000, selling_price: 44000 },
            stock: 30,
            images: [
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["necklaces", "chain", "gold", "herringbone", "sleek"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Chain Type", value: "Herringbone" },
                { key: "Width", value: "4mm" },
                { key: "Length", value: "16 inches" },
                { key: "Weight", value: "12g" }
            ]
        },
        {
            name: "Emerald Tear Drop Pendant",
            description: "A vibrant pear-shaped natural emerald pendant suspended from an 18k gold chain, accented with delicate diamond pavé.",
            brand: "Luxe Gems",
            pricing: { mrp: 85000, selling_price: 68000 },
            stock: 15,
            images: [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["necklaces", "emerald", "pendant", "gold", "gemstones"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Gemstone", value: "Emerald & Diamond" },
                { key: "Emerald Weight", value: "1.2 Carats" },
                { key: "Chain Length", value: "18 inches" },
                { key: "Pendant Size", value: "15mm" }
            ]
        },
        {
            name: "Vintage Locket Pendant",
            description: "An intricately detailed, hand-carved floral vintage locket in 14k yellow gold. Opens to hold two small photographs.",
            brand: "Minimalist Charm",
            pricing: { mrp: 28000, selling_price: 22000 },
            stock: 25,
            images: [
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["necklaces", "locket", "vintage", "gold", "keepsake"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "14k Yellow Gold" },
                { key: "Style", value: "Vintage Locket" },
                { key: "Closure", value: "Hinged" },
                { key: "Locket Height", value: "20mm" },
                { key: "Chain Length", value: "20 inches" }
            ]
        }
    ],
    "Earrings": [
        {
            name: "Diamond Stud Earrings",
            description: "Classic four-prong basket solitaire diamond studs in 18k white gold. Timeless elegance for everyday luxury.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 80000, selling_price: 64000 },
            stock: 18,
            images: [
                "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["earrings", "studs", "diamond", "white-gold", "classic"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k White Gold" },
                { key: "Gemstone", value: "Diamond" },
                { key: "Total Weight", value: "0.80 Carats (pair)" },
                { key: "Backing", value: "Push Back" },
                { key: "Cut", value: "Round Brilliant" }
            ]
        },
        {
            name: "Classic 18k Gold Hoops",
            description: "Polished and versatile 18k yellow gold hoop earrings. Crafted with a lightweight, hollow design for comfortable all-day wear.",
            brand: "Solid Gold Co.",
            pricing: { mrp: 25000, selling_price: 19999 },
            stock: 35,
            images: [
                "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["earrings", "hoops", "gold", "classic", "minimalist"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Diameter", value: "30mm" },
                { key: "Thickness", value: "3mm" },
                { key: "Closure", value: "Hinge & Click" },
                { key: "Weight", value: "6g (pair)" }
            ]
        },
        {
            name: "South Sea Pearl Drop Earrings",
            description: "Breathtaking South Sea pearls hanging gracefully below a row of brilliant-cut diamonds, set in 18k yellow gold.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 110000, selling_price: 88000 },
            stock: 10,
            images: [
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["earrings", "pearl", "south-sea", "luxury", "drop-earrings"],
            is_featured: true,
            specifications: [
                { key: "Pearl Type", value: "South Sea" },
                { key: "Pearl Size", value: "10mm" },
                { key: "Gemstone", value: "Diamonds & Pearl" },
                { key: "Drop Length", value: "25mm" },
                { key: "Backing", value: "Leverback" }
            ]
        },
        {
            name: "Sapphire Huggie Earrings",
            description: "Charming mini huggies in 14k white gold, channel-set with vibrant round Ceylon blue sapphires. Perfect for layering.",
            brand: "Luxe Gems",
            pricing: { mrp: 40000, selling_price: 32000 },
            stock: 22,
            images: [
                "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["earrings", "huggies", "sapphire", "white-gold", "everyday"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "14k White Gold" },
                { key: "Gemstone", value: "Blue Sapphire" },
                { key: "Inner Diameter", value: "8mm" },
                { key: "Closure", value: "Clicker" },
                { key: "Sapphire Count", value: "12 (pair)" }
            ]
        },
        {
            name: "Art Deco Chandelier Earrings",
            description: "Ornate geometric chandelier earrings inspired by the 1920s Art Deco movement, featuring onyx, diamonds, and white gold.",
            brand: "Vintage Treasures",
            pricing: { mrp: 145000, selling_price: 116000 },
            stock: 6,
            images: [
                "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["earrings", "chandelier", "art-deco", "vintage", "luxury"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k White Gold" },
                { key: "Gemstones", value: "Diamond & Black Onyx" },
                { key: "Drop Length", value: "55mm" },
                { key: "Total Diamond Weight", value: "1.5 Carats" },
                { key: "Style", value: "Vintage Chandelier" }
            ]
        }
    ],
    "Bracelets": [
        {
            name: "Diamond Tennis Bracelet",
            description: "A classic 4-carat total weight diamond tennis bracelet. Individual round diamonds are set in a flexible 18k white gold link chain.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 250000, selling_price: 199999 },
            stock: 8,
            images: [
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["bracelets", "tennis-bracelet", "diamond", "white-gold", "luxury"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k White Gold" },
                { key: "Gemstone", value: "Diamonds" },
                { key: "Total Carat Weight", value: "4.0 Carats" },
                { key: "Length", value: "7 inches" },
                { key: "Clasp", value: "Double-safety Box" }
            ]
        },
        {
            name: "Classic Gold Bangle",
            description: "A solid, polished 18k yellow gold bangle featuring a secure hidden hinge clasp. Designed to be worn solo or stacked.",
            brand: "Solid Gold Co.",
            pricing: { mrp: 95000, selling_price: 76000 },
            stock: 15,
            images: [
                "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["bracelets", "bangle", "gold", "classic", "stackable"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Bangle Width", value: "4mm" },
                { key: "Internal Diameter", value: "58mm" },
                { key: "Clasp", value: "Hinge with Safety Catch" },
                { key: "Weight", value: "18g" }
            ]
        },
        {
            name: "Silver Charm Bracelet",
            description: "A sterling silver link chain charm bracelet, featuring an elegant toggle clasp. Ready to hold your favorite charms.",
            brand: "Minimalist Charm",
            pricing: { mrp: 12000, selling_price: 9500 },
            stock: 50,
            images: [
                "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["bracelets", "silver", "charm", "chain", "minimalist"],
            is_featured: false,
            specifications: [
                { key: "Material", value: "925 Sterling Silver" },
                { key: "Clasp", value: "Toggle Clasp" },
                { key: "Length", value: "7.5 inches" },
                { key: "Finish", value: "High Polish" }
            ]
        },
        {
            name: "Emerald Statement Cuff",
            description: "A striking modern cuff bracelet crafted in textured 18k gold, set with two large pear-shaped natural emeralds.",
            brand: "Luxe Gems",
            pricing: { mrp: 175000, selling_price: 140000 },
            stock: 5,
            images: [
                "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["bracelets", "cuff", "emerald", "gold", "luxury", "statement"],
            is_featured: true,
            specifications: [
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Gemstone", value: "Emerald" },
                { key: "Emerald Weight", value: "3.5 Carats (total)" },
                { key: "Fit", value: "Flexible cuff" },
                { key: "Width", value: "12mm" }
            ]
        },
        {
            name: "Freshwater Pearl Bracelet",
            description: "A delicate strand of hand-selected freshwater pearls with a 14k rose gold clasp. Subtle and incredibly graceful.",
            brand: "Aura Fine Jewelry",
            pricing: { mrp: 20000, selling_price: 16000 },
            stock: 30,
            images: [
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["bracelets", "pearl", "freshwater", "rose-gold", "delicate"],
            is_featured: false,
            specifications: [
                { key: "Pearl Type", value: "Freshwater Cultured" },
                { key: "Pearl Size", value: "6mm" },
                { key: "Clasp Material", value: "14k Rose Gold" },
                { key: "Length", value: "7 inches" },
                { key: "Grade", value: "AAA Luster" }
            ]
        }
    ],
    "Jewelry Sets": [
        {
            name: "Royal Diamond & Pearl Set",
            description: "An exquisite set featuring a matched diamond-accented pearl necklace, matching drop earrings, and a tennis bracelet. The ultimate wedding set.",
            brand: "Imperial Bridal",
            pricing: { mrp: 450000, selling_price: 380000 },
            stock: 3,
            images: [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["sets", "bridal", "wedding", "pearl", "diamond", "luxury"],
            is_featured: true,
            specifications: [
                { key: "Set Includes", value: "Necklace, Earrings, Bracelet" },
                { key: "Materials", value: "18k White Gold" },
                { key: "Gemstones", value: "Diamonds & Akoya Pearls" },
                { key: "Occasion", value: "Bridal, Evening Gala" }
            ]
        },
        {
            name: "Emerald Bridal Ensemble",
            description: "Crafted in 18k yellow gold, this breathtaking set includes a statement collar necklace and matching chandelier earrings, set with brilliant natural emeralds.",
            brand: "Imperial Bridal",
            pricing: { mrp: 600000, selling_price: 499999 },
            stock: 2,
            images: [
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["sets", "emerald", "bridal", "gold", "luxury", "wedding"],
            is_featured: true,
            specifications: [
                { key: "Set Includes", value: "Collar Necklace, Earrings" },
                { key: "Material", value: "18k Yellow Gold" },
                { key: "Gemstone", value: "Colombian Emeralds" },
                { key: "Emerald Weight", value: "12 Carats total" }
            ]
        },
        {
            name: "Gold Filigree Heritage Set",
            description: "Featuring traditional fine gold filigree craftsmanship, this set comes with a heavy gold choker necklace and matching dangle earrings.",
            brand: "Heritage Gold",
            pricing: { mrp: 350000, selling_price: 299999 },
            stock: 5,
            images: [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["sets", "gold", "heritage", "filigree", "traditional"],
            is_featured: false,
            specifications: [
                { key: "Set Includes", value: "Choker, Earrings" },
                { key: "Material", value: "22k Yellow Gold" },
                { key: "Weight", value: "45g" },
                { key: "Style", value: "Traditional Heritage" }
            ]
        },
        {
            name: "Sapphire Starburst Trio",
            description: "An ultra-modern sapphire design, this set includes a starburst pendant necklace, matching stud earrings, and an open wrap ring.",
            brand: "Luxe Gems",
            pricing: { mrp: 220000, selling_price: 180000 },
            stock: 7,
            images: [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["sets", "sapphire", "white-gold", "modern", "starburst"],
            is_featured: true,
            specifications: [
                { key: "Set Includes", value: "Pendant, Studs, Ring" },
                { key: "Material", value: "14k White Gold" },
                { key: "Gemstone", value: "Royal Blue Sapphire" },
                { key: "Design", value: "Starburst Pavé" }
            ]
        },
        {
            name: "Minimalist Rose Gold Trio",
            description: "An everyday set featuring a tiny bar necklace, matching threader earrings, and a delicate chain bracelet, all in 14k rose gold.",
            brand: "Minimalist Charm",
            pricing: { mrp: 45000, selling_price: 36000 },
            stock: 15,
            images: [
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
            ],
            tags: ["sets", "rose-gold", "minimalist", "everyday", "delicate"],
            is_featured: false,
            specifications: [
                { key: "Set Includes", value: "Bar Necklace, Threader Earrings, Bracelet" },
                { key: "Material", value: "14k Rose Gold" },
                { key: "Finish", value: "Polished Rose Gold" }
            ]
        }
    ]
};

const seedJewelry = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing product, category, cart, wishlist, and review collections
        console.log('🗑️  Clearing existing collections...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Review.deleteMany({});
        await Cart.deleteMany({});
        await Wishlist.deleteMany({});
        await HeroSlide.deleteMany({});
        console.log('✅ Collections cleared!\n');

        // Create hero slides
        console.log('🖼️  Seeding hero slides...');
        const heroSlidesData = [
            {
                image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=80",
                order: 1
            },
            {
                image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1600&q=80",
                order: 2
            },
            {
                image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
                order: 3
            }
        ];
        await HeroSlide.insertMany(heroSlidesData);
        console.log('✅ Hero slides seeded successfully!\n');

        // Create categories
        console.log('📂 Seeding categories...');
        const createdCategories = await Category.insertMany(jewelryCategories);
        console.log(`✅ Successfully seeded ${createdCategories.length} categories!\n`);

        // Create category map of names to slugs/IDs
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat;
        });

        // Assemble and insert products
        const productsToInsert = [];
        for (const [categoryName, products] of Object.entries(jewelryProducts)) {
            const catDoc = categoryMap[categoryName];
            if (!catDoc) {
                console.log(`⚠️  Category "${categoryName}" not found in seeded categories. Skipping...`);
                continue;
            }

            console.log(`📦 Processing category: ${categoryName}`);
            for (const product of products) {
                const productData = {
                    ...product,
                    category: {
                        main: catDoc.name,
                        main_slug: catDoc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }
                };
                productsToInsert.push(productData);
                console.log(`   + Prepared: ${product.name}`);
            }
        }

        console.log(`\n📥 Inserting ${productsToInsert.length} products...`);
        const insertedProducts = await Product.insertMany(productsToInsert);
        console.log(`🎉 Successfully seeded ${insertedProducts.length} jewelry products!\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedJewelry();
