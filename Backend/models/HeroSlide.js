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
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            const baseUrl = (process.env.UPLOADS_BASE_URL || '').replace(/\/+$/, '');

            if (ret.image && !ret.image.startsWith('http://') && !ret.image.startsWith('https://')) {
                ret.image = `${baseUrl}/${ret.image}`;
            }

            return ret;
        },
    },
});

export default mongoose.model('HeroSlide', heroSlideSchema);
