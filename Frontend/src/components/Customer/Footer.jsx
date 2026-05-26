import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaLinkedinIn,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTruck,
    FaShieldAlt,
    FaGem,
    FaGift,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [openSections, setOpenSections] = useState({
        collection: false,
        services: false,
        showroom: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const footerLinks = {
        collection: [
            { name: 'Rings & Bands', path: '/category/rings' },
            { name: 'Necklaces & Pendants', path: '/category/necklaces' },
            { name: 'Earrings & Studs', path: '/category/earrings' },
            { name: 'Bracelets & Cuffs', path: '/category/bracelets' },
            { name: 'Fine Jewelry Sets', path: '/category/jewelry-sets' }
        ],
        services: [
            { name: 'Customer Support', path: '/support' },
            { name: 'Shipping & Delivery', path: '/shipping' },
            { name: 'Returns & Exchanges', path: '/returns' },
            { name: 'Lifetime Warranty Info', path: '/warranty' },
            { name: 'Track Order', path: '/track-order' }
        ],
        brand: [
            { name: 'Our Heritage', path: '/about' },
            { name: 'Craftsmanship & Materials', path: '/craftsmanship' },
            { name: 'Anti-Tarnish Care Guide', path: '/care-guide' },
            { name: 'Sustainability Commitment', path: '/sustainability' },
            { name: 'Store Locator', path: '/stores' }
        ]
    };

    return (
        <footer className="bg-emerald-deep text-[#f7f5f0] border-t border-gold-champagne/20 font-outfit relative">
            {/* Ambient luxury background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,168,128,0.03),transparent_40%)] pointer-events-none" />

            {/* Premium Features Bar */}
            <div className="hidden lg:block border-b border-gold-champagne/10 bg-emerald-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: FaGem, title: 'Lifetime Anti-Tarnish', desc: 'Crafted with premium durable alloys' },
                            { icon: FaTruck, title: 'Fully Insured Shipping', desc: 'Complimentary delivery on all orders' },
                            { icon: FaGift, title: 'Signature Packaging', desc: 'Arrives in our custom velvet box' },
                            { icon: FaShieldAlt, title: 'Secure Checkouts', desc: 'Fully encrypted payment processing' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full bg-gold-champagne/10 flex items-center justify-center flex-shrink-0 border border-gold-champagne/20 transition-all duration-300 group-hover:bg-gold-champagne/20">
                                    <feature.icon className="w-5 h-5 text-gold-champagne" />
                                </div>
                                <div>
                                    <p className="font-semibold text-xs text-white tracking-widest uppercase">{feature.title}</p>
                                    <p className="text-2xs text-[#a3b3ac] mt-0.5">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 pb-6 lg:pb-0 border-b border-gold-champagne/10 lg:border-none">
                        <div className="mb-6">
                            <h2 className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 89" className="h-10 w-auto">
                                    <defs>
                                        <linearGradient id="shiningGoldFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#BF953F" />
                                            <stop offset="25%" stopColor="#FCF6BA" />
                                            <stop offset="50%" stopColor="#B38728" />
                                            <stop offset="75%" stopColor="#FBF5B7" />
                                            <stop offset="100%" stopColor="#AA771C" />
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#shiningGoldFooter)" d="m73.5 13.3c0-6.4 2.1-10.7 8.1-10.7v-1h-30.4v1c5.6 0 8.5 2.4 8.5 10.4v25.3h-36.7v-25.3c0-6.1 1.8-10.5 8-10.5v-0.9h-29.2v0.9c4.7 0 7.3 2.4 7.3 9.2v61.4c0 7.2-2.5 10.2-7.4 10.3v1h29.3v-0.9c-5-0.1-8-1.7-8-10.7v-30.9h36.7v30.5c0 8.2-2.7 11-8.5 11.1v0.9h42.3v-0.9c-2.5 0-4.6-1.1-4.6-3.8 0-2.3 0.6-4.6 1.5-6.7l8.9-22.4c-1.1 0-2.5 0.2-3.6 0.5l-9.8 23.3c-1.8 4.4-4.2 8.7-7.1 8.7-2.6 0-5.3-2.1-5.3-10.5v-59.3z"/>
                                    <path fill="url(#shiningGoldFooter)" d="m152.9 75.9-5.9-12.3v-0.1l-0.6-1.4c-1.7-0.5-3-1.6-3.7-2.4-1.4-1.6-4.6-1.8-4.6-1.5 0.7 0.2 3.2-0.2 4.7 1.4 1.7 1.7 3.8 2.7 6.3 2.8 1.9 0.1 5.8-0.3 8-0.3-2.4-1-5.1-6-9.5-5.8-1.4-0.1-2.5 0.2-3.3 0.4l0.6 0.1h-0.8-0.1-0.4l-0.1-1.5c2.9-1.2 7.3-3 9.1-2.1 1.8 1 4 1.7 6.7 1.8 5.3 0 7.2-2.9 10.6-3.1l0.1-0.3c-3-0.2-4.7-2.6-7.4-2.8-3.5-0.8-5-1.2-10.5 2.3l-0.4 0.3c-2.4 0.9-5.3 1.1-8.8 2.8h-0.3l0.3 0.1h0.1-0.1-0.1-0.2-0.1-0.1-0.1l0.4-0.1-0.4 0.1 0.1-0.4-0.1-0.8c7.6-2.5 8.8-7.8 10.6-12.2l1.5-2.3c-3 2.3-9 2.4-12 6.8-1.5 2-2.1 4.2-1.9 6.7-0.7 4-3.9 5.5-5.9 6.9l2.5-2.5c1-0.9 1.9-2.5 2.4-3.6-0.2-1.6 0-2.9 0.3-4.1l-21.9-47.2h-1.4l-19.8 47c-4.6 1-9.3 3.7-11.9 6.8l0.1 0.4c3.2-3 9-5.9 14.5-5.9 3.6 0 7.6 3.4 7.9 7.5-0.4 0.2-0.7 0.5-0.7 1s0.3 0.8 0.7 1l-2.4 4.2h-1.3l-2.1 2.9c1.9 3.4 6.1 7.8 6.1 7.8s3.9-4.2 6-7.8l-2-2.9h-1.2l-2.6-4.2c0.4-0.1 0.7-0.5 0.7-1s-0.3-0.8-0.6-1c0-2.5-1.8-5.8-4.5-7.8 10 0 20 6.5 20 16 0 7.2-5.8 15.4-12.6 21.8h1.3c4.4-2.5 8.9-8.5 12.8-14.8 2.5-4.7 6.6-7.1 8.6-6.6h0.1l4.6 10.9c1.9 3.7-0.6 6.5-4.4 6.5v0.9h29.8v-0.8c-4.3 0-7.6-1.4-10.7-7.6zm-45.4-16.8c-0.4 0-0.6-0.3-0.6-0.6 0-0.4 0.2-0.7 0.6-0.7s0.6 0.3 0.6 0.7c0 0.3-0.2 0.6-0.6 0.6zm16 12c0.6-1.3 1-3.3 1-5.5 0-9.2-8.5-17.6-21.6-17.6h-2.4l12.1-29.9 18.8 43.4v0.1h0.1c-2.2 2.3-6.6 7-8 9.5zm5.5-5.2 3.1-3.1 0.8 2.1c-1 0-2.4 0.2-3.9 1z"/>
                                </svg>
                            </h2>
                            <p className="text-[#a3b3ac] text-sm leading-relaxed max-w-sm">
                                Elevating everyday elegance with our meticulously designed, premium anti-tarnish jewelry. Discover pieces that celebrate your inner brilliance.
                            </p>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] mb-4 text-gold-champagne">Follow HA</h4>
                            <div className="flex gap-3">
                                {[
                                    { icon: FaFacebookF, color: 'hover:bg-blue-600 hover:text-white', label: 'Facebook' },
                                    { icon: FaTwitter, color: 'hover:bg-sky-500 hover:text-white', label: 'Twitter' },
                                    { icon: FaInstagram, color: 'hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white', label: 'Instagram' },
                                    { icon: FaYoutube, color: 'hover:bg-red-600 hover:text-white', label: 'YouTube' },
                                    { icon: FaLinkedinIn, color: 'hover:bg-blue-700 hover:text-white', label: 'LinkedIn' }
                                ].map((social, index) => (
                                    <button
                                        key={index}
                                        aria-label={social.label}
                                        className={`w-9 h-9 rounded-full bg-transparent text-[#a3b3ac] border border-gold-champagne/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-gold-champagne ${social.color}`}
                                    >
                                        <social.icon className="w-3.5 h-3.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Collection Links */}
                    <div className="pb-4 lg:pb-0 border-b border-[#d4c5b3]/10 lg:border-none">
                        <button
                            onClick={() => toggleSection('collection')}
                            className="w-full flex items-center justify-between text-left lg:pointer-events-none focus:outline-none"
                        >
                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-5">
                                The Collection
                            </h4>
                            <span className="lg:hidden text-gold-champagne">
                                {openSections.collection ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                            </span>
                        </button>
                        <ul className={`space-y-3 transition-all duration-300 overflow-hidden lg:max-h-full ${
                            openSections.collection ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                        }`}>
                            {footerLinks.collection.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#a3b3ac] hover:text-gold-lustrous transition-all duration-200 text-xs font-medium uppercase tracking-[0.1em] hover:translate-x-1 inline-block transform focus:outline-none"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div className="pb-4 lg:pb-0 border-b border-[#d4c5b3]/10 lg:border-none">
                        <button
                            onClick={() => toggleSection('services')}
                            className="w-full flex items-center justify-between text-left lg:pointer-events-none focus:outline-none"
                        >
                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-5">
                                Client Services
                            </h4>
                            <span className="lg:hidden text-gold-champagne">
                                {openSections.services ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                            </span>
                        </button>
                        <ul className={`space-y-3 transition-all duration-300 overflow-hidden lg:max-h-full ${
                            openSections.services ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                        }`}>
                            {footerLinks.services.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#a3b3ac] hover:text-gold-lustrous transition-all duration-200 text-xs font-medium uppercase tracking-[0.1em] hover:translate-x-1 inline-block transform focus:outline-none"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Brand / Contact Info */}
                    <div className="pb-4 lg:pb-0 border-b border-[#d4c5b3]/10 lg:border-none">
                        <button
                            onClick={() => toggleSection('showroom')}
                            className="w-full flex items-center justify-between text-left lg:pointer-events-none focus:outline-none"
                        >
                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-5">
                                Flagship Showroom
                            </h4>
                            <span className="lg:hidden text-gold-champagne">
                                {openSections.showroom ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                            </span>
                        </button>
                        <ul className={`space-y-4 transition-all duration-300 overflow-hidden lg:max-h-full ${
                            openSections.showroom ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                        }`}>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-gold-champagne mt-1 flex-shrink-0" />
                                <span className="text-[#a3b3ac] text-xs leading-relaxed uppercase tracking-[0.05em]">
                                    45 Grand Avenue,<br />
                                    Luxury District, Chennai,<br />
                                    Tamil Nadu, India - 600002
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="w-4 h-4 text-gold-champagne flex-shrink-0" />
                                <a
                                    href="tel:+919876543210"
                                    className="text-[#a3b3ac] hover:text-gold-lustrous text-xs uppercase tracking-[0.05em] transition-colors focus:outline-none"
                                >
                                    +91 98765 43210
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="w-4 h-4 text-gold-champagne flex-shrink-0" />
                                <a
                                    href="mailto:concierge@heyazhagi.com"
                                    className="text-[#a3b3ac] hover:text-gold-lustrous text-xs uppercase tracking-[0.05em] transition-colors focus:outline-none"
                                >
                                    concierge@heyazhagi.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gold-champagne/5 bg-emerald-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-[#a3b3ac] text-center md:text-left">
                            © {currentYear} <span className="text-gold-lustrous font-semibold">HA</span>. All rights reserved.
                        </p>
                        <p className="text-[10px] text-[#a3b3ac]/50 uppercase tracking-widest text-center md:text-right">
                            Handcrafted Luxury | Made with ❤️ in India
                        </p>
                    </div>
                </div>
            </div>

            {/* Tiny spacer to avoid blocking of bottom menu on mobile view */}
            <div className="h-16 md:hidden bg-[#070b09]"></div>
        </footer>
    );
};

export default Footer;
