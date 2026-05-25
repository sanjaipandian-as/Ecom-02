import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaShare, FaShareAlt, FaTag, FaInfoCircle, FaBox, FaChevronDown, FaArrowDown, FaRegHeart, FaHeart, FaEye, FaArrowRight, FaCheck, FaTruck, FaShoppingBag, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { MdLocalShipping, MdSecurity, MdVerified, MdOutlineFlashOn } from 'react-icons/md';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';
import Topbar from './Topbar';
import Footer from './Footer';

// Internal Accordion Component
const AccordionItem = ({ title, isOpen, onClick, children, icon: Icon }) => (
    <div className="border border-slate-200 mb-4 overflow-hidden bg-white hover:border-slate-300 transition-colors">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 text-left bg-white transition-all duration-300"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-semibold text-base md:text-lg transition-colors tracking-wide uppercase text-xs ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : 'text-slate-400'}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 pt-0 text-slate-600 leading-relaxed font-medium">
                {children}
            </div>
        </div>
    </div>
);

const Productview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState('M');

    // Reviews & State
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', reviewText: '', tags: [] });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const [expandedSection, setExpandedSection] = useState('description');

    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Auth Check
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    API.get(`/products/customer/product/${id}`),
                    API.get('/products/customer/page?page=1'),
                    API.get(`/reviews/${id}`),
                    isLoggedIn ? API.get('/wishlist') : Promise.resolve({ value: { data: [] } }),
                    isLoggedIn ? API.get('/cart') : Promise.resolve({ value: { data: [] } }),
                    isLoggedIn ? API.get(`/reviews/can-review/${id}`) : Promise.resolve({ value: { data: { canReview: false } } })
                ]);

                if (results[0].status === 'fulfilled') {
                    setProduct(results[0].value.data);
                } else {
                    setError('Failed to load product.');
                }

                if (results[1].status === 'fulfilled') {
                    const products = results[1].value.data.products || [];
                    setSimilarProducts(products.filter(p => p._id !== id).slice(0, 4)); // Reduced to 4 for cleaner look
                }

                if (results[2].status === 'fulfilled') {
                    const reviewsData = Array.isArray(results[2].value.data) ? results[2].value.data : [];
                    setReviews(reviewsData);
                    if (isLoggedIn) {
                        const user = localStorage.getItem('user');
                        if (user) {
                            const userId = JSON.parse(user)?._id;
                            setUserReview(reviewsData.find(r => r.customerId?._id === userId));
                        }
                    }
                }

                if (results[3]?.status === 'fulfilled' && results[3].value?.data) {
                    const wData = Array.isArray(results[3].value.data) ? results[3].value.data : [];
                    const ids = wData.map(i => i.productId?._id).filter(Boolean);
                    setWishlistItems(ids);
                    setIsInWishlist(ids.includes(id));
                }

                if (results[4]?.status === 'fulfilled' && results[4].value?.data) {
                    const cItems = results[4].value.data.items || [];
                    setCartItems(cItems);
                    setIsInCart(cItems.some(i => (i.productId?._id || i.productId) === id));
                }

                if (results[5]?.status === 'fulfilled' && results[5].value?.data) {
                    setCanReview(!!results[5].value.data.canReview);
                } else {
                    setCanReview(false);
                }

            } catch (err) {
                console.error(err);
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, isLoggedIn]);

    const handleQuantityChange = useCallback((action) => {
        if (!product) return;
        const max = product.stock || 0;
        if (action === 'increase' && quantity < max) setQuantity(q => q + 1);
        if (action === 'decrease' && quantity > 1) setQuantity(q => q - 1);
    }, [product, quantity]);

    const addToCartAction = useCallback(async (isBuyNow = false) => {
        if (!isLoggedIn) return navigate('/Login');

        // If Buy Now: just go to checkout with this product's state
        if (isBuyNow) {
            navigate('/checkout', {
                state: {
                    product: product,
                    quantity: quantity
                }
            });
            return;
        }

        if (isInCart) return navigate('/Cart');

        try {
            await API.post('/cart/add', { productId: product._id, quantity });
            setIsInCart(true);
            const res = await API.get('/cart');
            setCartItems(res.data.items || []);
        } catch (e) {
            console.error(e);
            alert('Failed to add to cart.');
        }
    }, [isLoggedIn, isInCart, product, quantity, navigate]);

    const toggleWishlist = useCallback(async () => {
        if (!isLoggedIn) return navigate('/Login');
        if (togglingWishlist) return;

        setTogglingWishlist(true);
        try {
            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${id}`);
                setIsInWishlist(false);
            } else {
                await API.post('/wishlist/add', { productId: id });
                setIsInWishlist(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTogglingWishlist(false);
        }
    }, [isLoggedIn, isInWishlist, id, navigate, togglingWishlist]);

    const handleAddReview = async () => {
        if (!isLoggedIn) return navigate('/Login');
        setSubmittingReview(true);
        try {
            await API.post('/reviews/add', { productId: id, ...reviewForm });
            setShowReviewForm(false);
            setReviewForm({ rating: 5, title: '', reviewText: '', tags: [] });

            // Refresh product reviews list
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data);

            // Set userReview
            const user = localStorage.getItem('user');
            if (user) {
                const userId = JSON.parse(user)?._id;
                setUserReview(res.data.find(r => r.customerId?._id === userId));
            }
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleVote = async (reviewId, type) => {
        try {
            await API.post(`/reviews/vote/${reviewId}`, { type });
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data);
        } catch (e) {
            console.error('Error voting review:', e);
        }
    };

    const handleShare = async () => {
        if (!product) return;
        const shareData = {
            title: product.name,
            text: `Check out this product: ${product.name}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy link:', err);
                alert('Failed to copy product link.');
            }
        }
    };

    const productImages = useMemo(() => {
        const valid = product?.images?.filter(img => img && typeof img === 'string' && img.trim() !== '');
        return valid?.length ? valid : [placeholderImg];
    }, [product, placeholderImg]);
    const inStock = (product?.stock || 0) > 0;
    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;
    const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    const starCounts = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
        });
        return counts;
    }, [reviews]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return '0.0';
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return avg.toFixed(1);
    }, [reviews]);

    const recommendPercentage = useMemo(() => {
        if (!reviews.length) return 100;
        const positiveReviews = reviews.filter(r => r.rating >= 4).length;
        return Math.round((positiveReviews / reviews.length) * 100);
    }, [reviews]);

    const customerLikes = useMemo(() => {
        const counts = {
            "Ease of Shopping": 0,
            "Product Design": 0,
            "Customer Service": 0,
            "Delivery Experience": 0,
            "Packaging": 0
        };
        reviews.forEach(r => {
            if (r.tags && Array.isArray(r.tags)) {
                r.tags.forEach(tag => {
                    if (counts[tag] !== undefined) {
                        counts[tag]++;
                    }
                });
            }
        });
        return counts;
    }, [reviews]);

    const availableTags = ["Delivery Experience", "Product Design", "Packaging", "Ease of Shopping", "Customer Service"];

    // Pagination for reviews feed
    const reviewsPerPage = 5;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage) || 1;
    const paginatedReviews = useMemo(() => {
        const start = (reviewPage - 1) * reviewsPerPage;
        return reviews.slice(start, start + reviewsPerPage);
    }, [reviews, reviewPage]);

    if (loading) return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-slate-50" />)}
                    </div>
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        <div className="h-12 bg-slate-50 w-3/4" />
                        <div className="h-6 bg-slate-50 w-1/4" />
                        <div className="h-24 bg-slate-50 w-full" />
                        <div className="h-16 bg-slate-100 w-full" />
                        <div className="h-16 bg-slate-900 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-12 text-center font-sans">
            <div className="w-24 h-24 bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                <FaInfoCircle className="text-slate-200 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4 tracking-tight uppercase">Product Not Located</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-md mx-auto">{error || "The requested item is currently unavailable in our collection."}</p>
            <button
                onClick={() => navigate('/')}
                className="px-12 py-4 bg-[#0F172A] text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95"
            >
                Return To Collection
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 pb-[120px] lg:pb-0">
            <Topbar />

            <main className="flex-1 max-w-[1440px] mx-auto px-6 md:px-12 py-8 lg:py-16 w-full">

                {/* --- PRIMARY PRODUCT SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 mb-16 items-start">

                    {/* --- LEFT: STUDIO DYNAMIC IMAGE GRID --- */}
                    <div className="lg:col-span-5 xl:col-span-5">
                        <div className="flex flex-col gap-4">
                            {productImages.length === 1 ? (
                                <div className="w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-xl border border-gold-champagne/15 bg-cream-base relative group cursor-pointer shadow-sm">
                                    <img
                                        src={productImages[0]}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        alt="Product view"
                                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                    />
                                </div>
                            ) : productImages.length === 2 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {productImages.map((img, i) => (
                                        <div key={i} className="w-full aspect-[4/5] overflow-hidden rounded-xl border border-gold-champagne/15 bg-cream-base relative group cursor-pointer shadow-sm">
                                            <img
                                                src={img}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                alt={`Product view ${i + 1}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : productImages.length === 3 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 w-full aspect-[8/5] overflow-hidden rounded-xl border border-gold-champagne/15 bg-cream-base relative group cursor-pointer shadow-sm">
                                        <img
                                            src={productImages[0]}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt="Product main view"
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                    </div>
                                    {productImages.slice(1, 3).map((img, i) => (
                                        <div key={i + 1} className="col-span-1 w-full aspect-[4/5] overflow-hidden rounded-xl border border-gold-champagne/15 bg-cream-base relative group cursor-pointer shadow-sm">
                                            <img
                                                src={img}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                alt={`Product view ${i + 2}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {productImages.slice(0, 4).map((img, i) => (
                                        <div key={i} className="w-full aspect-[4/5] overflow-hidden rounded-xl border border-gold-champagne/15 bg-cream-base relative group cursor-pointer shadow-sm">
                                            <img
                                                src={img}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                alt={`Product view ${i + 1}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: EXECUTIVE TRANSACTIONAL SIDEBAR --- */}
                    <div className="lg:col-span-7 xl:col-span-7 flex flex-col">

                        {/* Product Header */}
                        <div className="mb-4 font-sans">
                            <h1 className="text-2xl xl:text-3xl text-emerald-deep mb-2 font-serif font-bold tracking-wide capitalize">
                                {product.name.toLowerCase()}
                            </h1>
                            <p className="text-luxury-crimson text-[12px] font-bold uppercase tracking-wider mb-5">
                                In Demand! 10+ Shoppers bought this in the last 30 Days
                            </p>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 border border-gold-champagne/20 rounded-full px-3 py-1.5 bg-white shadow-xs">
                                        <span className="font-semibold text-slate-700 text-sm">{averageRating}</span>
                                        <FaStar className="text-gold-lustrous text-[10px]" />
                                        <span className="text-slate-400 text-xs ml-1">{reviews.length}</span>
                                    </div>
                                    <button className="border border-gold-champagne/20 rounded-full px-4 py-1.5 bg-white shadow-xs text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 hover:bg-cream-base hover:text-gold-lustrous transition-all">
                                        View Details <FaArrowDown className="text-[10px] text-gold-lustrous" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={handleShare} className="w-10 h-10 border border-gold-champagne/20 rounded-xl flex items-center justify-center bg-white shadow-xs text-slate-500 hover:text-gold-lustrous hover:-translate-y-0.5 transition-all">
                                        <FaShareAlt />
                                    </button>
                                    <button onClick={toggleWishlist} className="w-10 h-10 border border-gold-champagne/20 rounded-xl flex items-center justify-center bg-white shadow-xs text-slate-500 hover:text-luxury-crimson hover:-translate-y-0.5 transition-all">
                                        {isInWishlist ? <FaHeart className="text-luxury-crimson" /> : <FaRegHeart />}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-emerald-deep text-[#faf6e9] text-[9px] font-bold px-3 py-1.5 w-fit rounded-none mb-4 flex items-center gap-1.5 uppercase tracking-widest border border-gold-champagne/20 shadow-xs">
                                <FaStar className="text-[8px] text-gold-lustrous" /> TOP RATED
                            </div>

                            <div className="flex items-end gap-3 mb-3">
                                <span className="text-3xl font-bold text-gold-lustrous tracking-tight">₹{sellingPrice.toLocaleString()}</span>
                                {mrp > sellingPrice && (
                                    <span className="text-lg text-slate-400 font-medium line-through mb-0.5">₹{mrp.toLocaleString()}</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="bg-gold-champagne/10 border border-gold-champagne/20 text-gold-lustrous text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest">
                                    OFFER: {discount > 0 ? `${discount}% OFF` : 'SPECIAL PRICE'} ON MAKING
                                </div>
                                <div className="text-xs">
                                    <button className="text-gold-lustrous underline underline-offset-2 hover:text-gold-deep transition-colors font-bold uppercase tracking-wider">Notify me</button> <span className="text-slate-500">When Price Drops</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="border border-gold-champagne/20 rounded-xl p-4 flex gap-4 mb-8 bg-white shadow-xs">
                            <div className="mt-1"><FaTruck className="text-gold-lustrous text-xl" /></div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">Free Shipping by Tomorrow</h4>
                                <p className="text-xs text-slate-500 mb-1">Order within 20:41:02 to enjoy 24-hours shipping!</p>
                                <button className="text-gold-lustrous text-xs underline underline-offset-2 hover:text-gold-deep transition-colors font-bold uppercase tracking-wider">T&C Apply</button>
                            </div>
                        </div>

                        {/* Sizing & Selection Box */}
                        <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gold-champagne/15 p-8 mb-10 relative overflow-hidden">
                            <h3 className="text-center font-serif text-xl text-emerald-deep mb-3">Sizing & Selection</h3>
                            <div className="w-8 h-[2px] bg-gold-lustrous mx-auto mb-8"></div>

                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Select Chain Size</label>
                            <div className="relative mb-6">
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full border border-gold-champagne/20 rounded-xl p-4 appearance-none text-slate-700 bg-white focus:outline-none focus:border-gold-lustrous transition-colors cursor-pointer text-sm"
                                >
                                    {['16 ( 40.64 cm )', '18 ( 45.72 cm )', '20 ( 50.8 cm )'].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quantity:</span>
                                <div className="flex items-center border border-gold-champagne/20 rounded-lg h-10 w-28 px-1">
                                    <button onClick={() => handleQuantityChange('decrease')} className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-black font-bold transition-colors">−</button>
                                    <span className="flex-1 text-center font-medium text-sm text-[#0F172A]">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('increase')} className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-black font-bold transition-colors">+</button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => addToCartAction(false)}
                                    disabled={!inStock}
                                    className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border-2 cursor-pointer ${isInCart
                                            ? 'bg-gold-champagne/10 border-gold-champagne/20 text-gold-lustrous hover:bg-gold-champagne/20'
                                            : 'bg-white hover:bg-gold-champagne/5 border-gold-lustrous text-gold-lustrous'
                                        } disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50`}
                                >
                                    <FaShoppingBag className="text-base" />
                                    {isInCart ? 'VIEW IN CART' : 'ADD TO CART'}
                                </button>
                                <button
                                    onClick={() => addToCartAction(true)}
                                    disabled={!inStock}
                                    className="flex-1 bg-emerald-deep hover:bg-gold-lustrous text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-slate-300 shadow-md shadow-emerald-deep/10 hover:shadow-lg active:scale-[0.98]"
                                >
                                    <MdOutlineFlashOn className="text-xl" />
                                    BUY NOW
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- SECONDARY: INFO & REVIEWS --- */}
                <div className="space-y-8">
                    {/* Fulfillment Quick-Deck */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-slate-200 bg-white">
                        {[
                            { icon: MdLocalShipping, title: "COMPLIMENTARY SHIPPING", text: "Global Dispatch" },
                            { icon: MdVerified, title: "AUTHENTICITY", text: "Verified Quality" },
                            { icon: MdSecurity, title: "SECURE PAYMENT", text: "Encrypted Processing" },
                            { icon: FaBox, title: "EASY RETURNS", text: "30-Day Policy" },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex flex-col gap-4 items-center text-center p-8 border-slate-200 ${idx !== 3 ? 'border-r' : ''} ${idx < 2 ? 'border-b md:border-b-0' : ''} group hover:bg-slate-50 transition-colors`}>
                                <div className="w-12 h-12 flex items-center justify-center text-black">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black text-[10px] uppercase tracking-[0.1em] mb-2">{item.title}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium leading-tight">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <AccordionItem
                            title="DESCRIPTION & DETAILS"
                            icon={FaInfoCircle}
                            isOpen={expandedSection === 'description'}
                            onClick={() => setExpandedSection(expandedSection === 'description' ? '' : 'description')}
                        >
                            <div className="py-2">
                                <p className="whitespace-pre-line text-slate-600 text-sm font-medium leading-[1.8]">{product.description || 'No description available for this product.'}</p>
                            </div>
                        </AccordionItem>

                        {product.specifications?.length > 0 && (
                            <AccordionItem
                                title="SPECIFICATIONS"
                                icon={FaTag}
                                isOpen={expandedSection === 'specs'}
                                onClick={() => setExpandedSection(expandedSection === 'specs' ? '' : 'specs')}
                            >
                                <div className="grid grid-cols-1 gap-0 py-2">
                                    {product.specifications.map((spec, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-4 transition-colors">
                                            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{spec.key}</span>
                                            <span className="text-black text-sm font-bold">{spec.value} {spec.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>
                        )}

                        <AccordionItem
                            title={`CLIENT REVIEWS (${reviews.length})`}
                            icon={FaStar}
                            isOpen={expandedSection === 'reviews'}
                            onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                        >
                            <div className="flex flex-col items-center justify-center my-8">
                            <h3 className="text-xl sm:text-2xl font-serif text-slate-800 tracking-normal mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>Customer Reviews</h3>
                            <div className="w-12 h-[2px] bg-gold-lustrous"></div>
                        </div>

                        {/* Responsive Two-Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-4">

                            {/* LEFT COLUMN: RATING BREAKDOWN */}
                            <div className="lg:col-span-4 space-y-8 pr-0 lg:pr-6 lg:border-r lg:border-slate-100">

                                {/* Average Rating Block */}
                                <div className="text-center lg:text-left space-y-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Average Rating</span>
                                    <div className="flex items-baseline justify-center lg:justify-start gap-2">
                                        <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{averageRating}</span>
                                        <span className="text-xl font-bold text-slate-400">/ 5</span>
                                    </div>

                                    {/* Star Rating Icons */}
                                    <div className="flex justify-center lg:justify-start gap-1 py-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={star <= Math.round(Number(averageRating)) ? 'text-gold-lustrous text-lg' : 'text-slate-200 text-lg'}
                                            />
                                        ))}
                                    </div>

                                    {/* Reviews count label */}
                                    <span className="text-xs text-slate-500 font-bold tracking-wide block">{reviews.length} reviews</span>
                                </div>

                                {/* Rating progress bars distribution breakdown */}
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = starCounts[star] || 0;
                                        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                                <span className="w-8 text-right flex items-center justify-end gap-1">
                                                    {star} <FaStar className="text-slate-400 text-[10px]" />
                                                </span>
                                                <div className="flex-1 h-2 bg-slate-100 rounded-none overflow-hidden relative">
                                                    <div
                                                        className="h-full bg-gold-lustrous transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-slate-400 font-bold">({count})</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Recommendation Percentage Box */}
                                <div className="p-5 bg-gold-champagne/10 border border-gold-champagne/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-champagne/25 text-gold-lustrous flex items-center justify-center flex-shrink-0">
                                        <FaThumbsUp className="text-sm" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-deep leading-relaxed uppercase tracking-wider">
                                        {recommendPercentage}% of customers recommend this product
                                    </span>
                                </div>

                                {/* "WHAT CUSTOMERS LIKED" block */}
                                <div className="space-y-4 pt-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">What Customers Liked</span>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag) => {
                                            const count = customerLikes[tag] || 0;
                                            return (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                                >
                                                    {tag} ({count})
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: PRODUCT REVIEWS FEED */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Product Reviews</span>

                                    {/* Actionable Review Trigger */}
                                    {canReview && !userReview && !showReviewForm && (
                                        <button
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                    navigate('/Login');
                                                } else {
                                                    setShowReviewForm(true);
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-black text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                        >
                                            Write A Review
                                        </button>
                                    )}
                                </div>

                                {/* Locked info message for non-purchasers */}
                                {isLoggedIn && !canReview && !userReview && (
                                    <div className="p-4 bg-amber-50/60 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest text-center leading-relaxed">
                                        Only customers who have purchased this product can write a review.
                                    </div>
                                )}

                                {!isLoggedIn && (
                                    <div className="p-4 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest text-center leading-relaxed">
                                        Please sign in to write a review.
                                    </div>
                                )}

                                {/* Review Form */}
                                {showReviewForm && (
                                    <div className="bg-white p-6 sm:p-8 border border-gold-champagne/20 space-y-6">
                                        <h4 className="font-bold text-emerald-deep text-sm uppercase tracking-widest text-center border-b border-gold-champagne/15 pb-4 font-serif">Rate & Review This Product</h4>
                                        
                                        {/* Rating Selection */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block text-center">Select Rating</label>
                                            <div className="flex justify-center gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                        className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${star <= reviewForm.rating ? 'text-gold-lustrous' : 'text-slate-200'}`}
                                                    >
                                                        <FaStar />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Review Title</label>
                                            <input
                                                type="text"
                                                value={reviewForm.title}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-black outline-none text-xs font-bold uppercase tracking-wider transition-colors"
                                                placeholder="Example: Outstanding Quality / Very Fast Shipping"
                                            />
                                        </div>

                                        {/* Tags Toggle Buttons */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">What did you like about this product? (Select tags)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableTags.map((tag) => {
                                                    const isSelected = reviewForm.tags.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => {
                                                                setReviewForm(prev => {
                                                                    const alreadySelected = prev.tags.includes(tag);
                                                                    const updated = alreadySelected
                                                                        ? prev.tags.filter(t => t !== tag)
                                                                        : [...prev.tags, tag];
                                                                    return { ...prev, tags: updated };
                                                                });
                                                            }}
                                                            className={`px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${isSelected
                                                                    ? 'bg-black border-black text-white'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Text Area */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Review Content</label>
                                            <textarea
                                                value={reviewForm.reviewText}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-black outline-none min-h-[120px] text-xs font-semibold leading-relaxed resize-none transition-colors"
                                                placeholder="Write your review comments here..."
                                            />
                                        </div>

                                        {/* Form Buttons */}
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowReviewForm(false)}
                                                className="flex-1 py-3.5 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddReview}
                                                disabled={submittingReview}
                                                className="flex-1 py-3.5 text-white font-bold text-[10px] uppercase tracking-widest bg-black hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                                            >
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Feed / Paginated Reviews */}
                                <div className="space-y-6">
                                    {paginatedReviews.length > 0 ? (
                                        paginatedReviews.map((r) => (
                                            <div key={r._id} className="py-6 border-b border-slate-100 last:border-0 hover:bg-slate-50/40 px-2 transition-colors">

                                                {/* Review Header */}
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">

                                                    {/* Rating, Title, Tags Badge */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {/* Star tag badge */}
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-champagne/10 text-gold-lustrous font-bold text-[11px] uppercase tracking-wide border border-gold-champagne/20">
                                                                {r.rating} <FaStar className="text-[10px] fill-current" />
                                                            </span>

                                                            {/* Review Title Headline */}
                                                            {r.title && (
                                                                <span className="font-extrabold text-slate-900 text-sm tracking-tight">{r.title}</span>
                                                            )}
                                                        </div>

                                                        {/* Selected tags badge row */}
                                                        {r.tags && r.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                {r.tags.map(t => (
                                                                    <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Side: Verification, Username, Date */}
                                                    <div className="text-left sm:text-right flex-shrink-0 space-y-1">
                                                        {/* Verified badge */}
                                                        <div className="inline-flex items-center gap-1.5 text-[#0A5C36] text-[10px] font-bold uppercase tracking-wider">
                                                            <FaCheck className="text-[9px]" /> Verified Purchase
                                                        </div>

                                                        {/* Reviewer Name */}
                                                        <p className="font-bold text-slate-800 text-xs uppercase tracking-wide block">
                                                            {r.customerId?.name || 'Customer'}
                                                        </p>

                                                        {/* Date format */}
                                                        <span className="text-[10px] text-slate-400 font-semibold block">
                                                            {new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Review Content */}
                                                <p className="text-slate-600 text-sm leading-[1.7] font-medium mb-4">
                                                    "{r.reviewText}"
                                                </p>

                                                {/* Voting Section */}
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    <span>Was this review helpful?</span>
                                                    <button
                                                        onClick={() => handleVote(r._id, 'up')}
                                                        className="flex items-center gap-1 hover:text-gold-lustrous transition-colors text-slate-500"
                                                    >
                                                        <FaThumbsUp className="text-[11px]" /> {r.helpfulVotes?.up || 0}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote(r._id, 'down')}
                                                        className="flex items-center gap-1 hover:text-rose-600 transition-colors text-slate-500"
                                                    >
                                                        <FaThumbsDown className="text-[11px]" /> {r.helpfulVotes?.down || 0}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews yet for this product.</p>
                                    )}
                                </div>

                                {/* Pagination Panel */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 pt-6 border-t border-slate-100">
                                        {/* Previous button */}
                                        <button
                                            onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                                            disabled={reviewPage === 1}
                                            className="w-9 h-9 border border-slate-200 text-slate-600 hover:border-black font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:border-slate-200"
                                        >
                                            &lt;
                                        </button>

                                        {/* Numeric pages buttons */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setReviewPage(p)}
                                                className={`w-9 h-9 font-semibold flex items-center justify-center transition-colors border ${p === reviewPage
                                                        ? 'bg-emerald-deep border-emerald-deep text-white'
                                                        : 'border-slate-200 text-slate-600 hover:border-black bg-white'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        {/* Next button */}
                                        <button
                                            onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))}
                                            disabled={reviewPage === totalPages}
                                            className="w-9 h-9 border border-slate-200 text-slate-600 hover:border-black font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:border-slate-200"
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionItem>
                </div>

                {/* --- SIMILAR PRODUCTS --- */}
                {similarProducts.length > 0 && (
                    <div className="mt-24 lg:mt-32">
                        <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-black tracking-widest uppercase">You Might Also Like</h2>
                            <button className="hidden md:flex items-center gap-2 text-xs font-bold text-black uppercase tracking-widest transition-all hover:gap-4">
                                View Collection <FaArrowRight />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            {similarProducts.map((p) => (
                                <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="group cursor-pointer">
                                    <div className="relative aspect-[3/4] bg-[#F8FAFC] overflow-hidden mb-6 border border-slate-100 transition-all duration-500 hover:border-black">
                                        <img
                                            src={p.images?.[0] || placeholderImg}
                                            alt={p.name}
                                            className="w-full h-full object-contain p-8 transition-transform duration-1000 group-hover:scale-105"
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{p.brand || 'Official'}</p>
                                    <h3 className="font-bold text-black text-sm mb-2 truncate uppercase tracking-wide group-hover:text-slate-600 transition-colors">{p.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-black text-sm">₹{p.pricing?.selling_price.toLocaleString()}</span>
                                        {p.pricing?.mrp > p.pricing?.selling_price && (
                                            <span className="text-xs text-slate-400 line-through">₹{p.pricing?.mrp.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
            </main >

    {/* --- MOBILE FOOTER --- */}
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 lg:hidden z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3 max-w-md mx-auto">
            <button
                onClick={() => addToCartAction(false)}
                disabled={!inStock}
                className={`flex-1 h-12 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${isInCart
                        ? 'bg-gold-champagne/10 border-gold-champagne/20 text-gold-lustrous'
                        : 'bg-white border-gold-lustrous text-gold-lustrous'
                    } disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50`}
            >
                {isInCart ? <FaCheck /> : <FaShoppingCart />} {isInCart ? 'VIEW CART' : 'ADD TO CART'}
            </button>
            <button
                onClick={() => addToCartAction(true)}
                disabled={!inStock}
                className="flex-1 h-12 bg-emerald-deep hover:bg-gold-lustrous text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-deep/10 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
                <MdOutlineFlashOn className="text-lg" />
                BUY NOW
            </button>
        </div>
            </div >

    <Footer />
        </div >
    );
};

export default Productview;