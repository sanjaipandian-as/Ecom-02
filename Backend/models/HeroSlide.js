import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: "Premium Skincare"
    },
    subtitle: {
        type: String,
        default: "Natural & Organic"
    },
    desc: {
        type: String,
        default: "Experience the ultimate in plant-based beauty."
    },
    price: {
        type: String,
        default: "499"
    },
    badge: {
        type: String,
        default: ""
    },
    ctaText: {
        type: String,
        default: "Shop Now"
    },
    ctaLink: {
        type: String,
        default: "/products"
    },
    order: {
        type: Number,
        default: 0
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

export default mongoose.model('HeroSlide', heroSlideSchema);
