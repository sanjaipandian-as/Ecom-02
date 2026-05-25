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
                            <h2 className="text-3xl font-bold tracking-[0.05em] uppercase text-gold-lustrous mb-4 font-serif">
                                HEY AZHAGi
                            </h2>
                            <p className="text-[#a3b3ac] text-sm leading-relaxed max-w-sm">
                                Elevating everyday elegance with our meticulously designed, premium anti-tarnish jewelry. Discover pieces that celebrate your inner brilliance.
                            </p>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] mb-4 text-gold-champagne">Follow HEY AZHAGi</h4>
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
                            © {currentYear} <span className="text-gold-lustrous font-semibold">HEY AZHAGi</span>. All rights reserved.
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
