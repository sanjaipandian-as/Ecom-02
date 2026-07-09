import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import Logo from '../Common/Logo';
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
    FaChevronUp,
    FaWhatsapp
} from 'react-icons/fa';

const categoryNameMap = {
    'face-care': 'Face Care',
    'hair-care': 'Hair Care',
    'body-care': 'Body Care',
    'lip-care': 'Lip Care',
    'skincare-kits': 'Skincare Kits',
    'kits': 'Skincare Kits'
};

const defaultCollectionLinks = [
    { name: 'Face Care', path: '/category/face-care' },
    { name: 'Hair Care', path: '/category/hair-care' },
    { name: 'Body Care', path: '/category/body-care' },
    { name: 'Lip Care', path: '/category/lip-care' },
    { name: 'Skincare Kits', path: '/category/skincare-kits' }
];

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [collectionLinks, setCollectionLinks] = useState([]);
    const [openSections, setOpenSections] = useState({
        collection: false,
        services: false,
        showroom: false
    });
    const [showCookieBanner, setShowCookieBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            const timer = setTimeout(() => {
                setShowCookieBanner(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowCookieBanner(false);
    };

    const rejectCookies = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShowCookieBanner(false);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.get('/categories');
                if (response.data && response.data.length > 0) {
                    const mapped = response.data
                        .filter(cat => cat.isActive !== false)
                        .map(cat => {
                            const slug = cat.name.toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)+/g, '');
                            const displayName = categoryNameMap[slug] || categoryNameMap[cat.name.toLowerCase()] || cat.name;
                            return {
                                name: displayName,
                                path: `/category/${slug}`
                            };
                        });
                    setCollectionLinks(mapped);
                } else {
                    setCollectionLinks([]);
                }
            } catch (error) {
                console.error('Error fetching categories for footer:', error);
                setCollectionLinks([]);
            }
        };
        fetchCategories();
    }, []);

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const footerLinks = {
        services: [
            { name: 'About Us', path: '/about' },
            { name: 'Customer Support', path: '/support' },
            { name: 'Shipping & Delivery', path: '/shipping' },
            { name: 'Returns & Exchanges', path: '/returns' },
            { name: 'Privacy Policy', path: '/privacy-policy' },
            { name: 'Terms & Conditions', path: '/terms-and-conditions' },
            { name: 'Track Order', path: '/track-order' }
        ],
        brand: [
            { name: 'Our Heritage', path: '/about' },
            { name: 'Ingredients & Safety', path: '/ingredients' },
            { name: 'Skincare Routine Guide', path: '/care-guide' },
            { name: 'Sustainability Commitment', path: '/sustainability' },
            { name: 'Store Locator', path: '/stores' }
        ]
    };

    return (
        <footer className="bg-emerald-deep text-[#f7f5f0] border-t border-gold-champagne/20 font-outfit relative">
            {/* Ambient luxury background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,168,128,0.03),transparent_40%)] pointer-events-none" />

            {/* Features Bar Removed */}

            {/* Main Footer Links */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 pb-6 lg:pb-0 border-b border-gold-champagne/10 lg:border-none">
                        <div className="mb-6">
                            <div className="mb-4 flex items-center gap-3">
                                <img src="/plenorabg.jpeg" alt="Plenora Logo" className="w-10 h-10 rounded-full object-cover" />
                                <Logo
                                    className="h-10 w-auto"
                                    primaryColor="#c5a880"
                                    secondaryColor="#f7f5f0"
                                />
                            </div>
                            <p className="text-sm text-[#a3b3ac] leading-relaxed mb-6 pe-4 lg:pe-8">
                                Plenora Scientific Skin is a skincare brand dedicated to combining the power of science with the purity of thoughtfully selected ingredients. Our mission is to create effective, high-quality skincare solutions that nourish, protect, and enhance your skin's natural beauty. Every formula is developed with a focus on innovation, safety, and visible results, helping you achieve healthy, radiant skin with confidence.
                            </p>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-[0.25em] mb-4 text-gold-champagne">Follow PLENORA</h4>
                            <div className="flex gap-3">
                                {[
                                    { icon: FaFacebookF, color: 'hover:bg-blue-600 hover:text-white', label: 'Facebook', url: 'https://www.facebook.com/share/1BT5As9w1w/' },
                                    { icon: FaInstagram, color: 'hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white', label: 'Instagram', url: 'https://www.instagram.com/plenorascientificskin?igsh=MTMwbG43Ynl2cGN5dQ==' },
                                    { icon: FaWhatsapp, color: 'hover:bg-green-500 hover:text-white', label: 'WhatsApp', url: 'https://wa.me/917448833345' }
                                ].map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className={`w-9 h-9 rounded-full bg-transparent text-[#a3b3ac] border border-gold-champagne/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-gold-champagne ${social.color}`}
                                    >
                                        <social.icon className="w-3.5 h-3.5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Collection Links */}
                    {collectionLinks.length > 0 && (
                        <div className="pb-4 lg:pb-0 border-b border-[#d4c5b3]/10 lg:border-none">
                            <button
                                onClick={() => toggleSection('collection')}
                                className="w-full flex items-center justify-between text-left lg:pointer-events-none focus:outline-none"
                            >
                                <h4 className="text-sm font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-4">
                                    The Collection
                                </h4>
                                <span className="lg:hidden text-gold-champagne">
                                    {openSections.collection ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                                </span>
                            </button>
                            <ul className={`space-y-2 transition-all duration-300 overflow-hidden lg:max-h-full ${openSections.collection ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                                }`}>
                                {collectionLinks.slice(0, 5).map((link, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => navigate(link.path)}
                                            className="text-[#a3b3ac] hover:text-gold-lustrous transition-all duration-200 text-xs md:text-sm font-medium uppercase tracking-[0.1em] hover:translate-x-1 inline-block transform focus:outline-none text-left"
                                        >
                                            {link.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Services Links */}
                    <div className="pb-4 lg:pb-0 border-b border-[#d4c5b3]/10 lg:border-none">
                        <button
                            onClick={() => toggleSection('services')}
                            className="w-full flex items-center justify-between text-left lg:pointer-events-none focus:outline-none"
                        >
                            <h4 className="text-sm font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-4">
                                Policies
                            </h4>
                            <span className="lg:hidden text-gold-champagne">
                                {openSections.services ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                            </span>
                        </button>
                        <ul className={`space-y-2 transition-all duration-300 overflow-hidden lg:max-h-full ${openSections.services ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                            }`}>
                            {footerLinks.services.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#a3b3ac] hover:text-gold-lustrous transition-all duration-200 text-xs md:text-sm font-medium uppercase tracking-[0.1em] hover:translate-x-1 inline-block transform focus:outline-none text-left"
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
                            <h4 className="text-sm font-bold uppercase tracking-[0.25em] text-gold-champagne lg:mb-4">
                                Flagship Showroom
                            </h4>
                            <span className="lg:hidden text-gold-champagne">
                                {openSections.showroom ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                            </span>
                        </button>
                        <ul className={`space-y-3 transition-all duration-300 overflow-hidden lg:max-h-full ${openSections.showroom ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-full overflow-hidden mt-0 lg:mt-0'
                            }`}>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-gold-champagne mt-1 flex-shrink-0" />
                                <span className="text-[#a3b3ac] text-xs md:text-sm leading-relaxed uppercase tracking-[0.05em]">
                                    Flat 407, Manchester Apartment,<br />
                                    Chelliamman Koil Street, Athipet,<br />
                                    Ambattur, Chennai 600058
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="w-4 h-4 text-gold-champagne flex-shrink-0" />
                                <a
                                    href="tel:+917448833345"
                                    className="text-[#a3b3ac] hover:text-gold-lustrous text-xs md:text-sm uppercase tracking-[0.05em] transition-colors focus:outline-none"
                                >
                                    +91 74488 33345
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="w-4 h-4 text-gold-champagne flex-shrink-0" />
                                <a
                                    href="mailto:plenorascientificskin@gmail.com"
                                    className="text-[#a3b3ac] hover:text-gold-lustrous text-xs md:text-sm uppercase tracking-[0.05em] transition-colors focus:outline-none"
                                >
                                    plenorascientificskin@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>




            {/* Bottom Bar */}
            <div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                            <p className="text-sm text-[#f7f5f0] text-center sm:text-left">
                                © {currentYear} <span className="font-semibold">Plenora</span>. All rights reserved.
                            </p>
                            <div className="flex gap-5">
                                <button onClick={() => navigate('/privacy-policy')} className="text-xs text-[#f7f5f0] hover:text-white uppercase tracking-wider transition-colors cursor-pointer">Privacy Policy</button>
                                <button onClick={() => navigate('/terms-and-conditions')} className="text-xs text-[#f7f5f0] hover:text-white uppercase tracking-wider transition-colors cursor-pointer">Terms & Conditions</button>
                            </div>
                        </div>
                        <p className="text-xs text-[#f7f5f0]/80 uppercase tracking-widest text-center md:text-right">
                            Glow with Confidence
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Cookie Consent Banner */}
            {showCookieBanner && (
                <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-[#0e1612]/95 backdrop-blur-md border border-gold-champagne/20 p-5 rounded-xl shadow-2xl z-50 animate-slideUp font-sans">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold-champagne/10 flex items-center justify-center text-gold-champagne shrink-0">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6c-.41 0-.75.34-.75.75v3.5c0 .41.34.75.75.75s.75-.34.75-.75v-3.5c0-.41-.34-.75-.75-.75zM12 5.5c-3.58 0-6.5 2.92-6.5 6.5s2.92 6.5 6.5 6.5 6.5-2.92 6.5-6.5-2.92-6.5-6.5-6.5z" />
                                </svg>
                            </div>
                            <div className="flex-1 col-span-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cookie Consent</h4>
                                <p className="text-[11px] text-[#a3b3ac] mt-1 leading-relaxed">
                                    We use cookies to enhance your experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies in accordance with our <button onClick={() => { navigate('/privacy-policy'); setShowCookieBanner(false); }} className="text-gold-lustrous underline hover:text-white transition-colors cursor-pointer">Privacy Policy</button> and <button onClick={() => { navigate('/terms-and-conditions'); setShowCookieBanner(false); }} className="text-gold-lustrous underline hover:text-white transition-colors cursor-pointer">Terms & Conditions</button>.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={rejectCookies}
                                className="px-4 py-2 border border-gold-champagne/20 text-[#a3b3ac] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-md cursor-pointer"
                            >
                                Reject
                            </button>
                            <button
                                onClick={acceptCookies}
                                className="px-4 py-2 bg-gold-champagne hover:bg-gold-lustrous text-[#0e1612] text-[10px] font-bold uppercase tracking-widest transition-all rounded-md shadow-md cursor-pointer"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tiny spacer to avoid blocking of bottom menu on mobile view */}
            <div className="h-16 md:hidden bg-[#070b09]"></div>
        </footer>
    );
};

export default Footer;
