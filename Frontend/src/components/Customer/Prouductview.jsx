import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    FaStar, FaShoppingCart, FaMinus, FaPlus, FaShareAlt, FaChevronDown, 
    FaRegHeart, FaHeart, FaArrowRight, FaCheck, FaTruck, FaShoppingBag, 
    FaThumbsUp, FaThumbsDown, FaChevronRight, FaChevronLeft
} from 'react-icons/fa';
import { MdSecurity, MdVerified, MdOutlineFlashOn, MdInfoOutline, MdClose } from 'react-icons/md';
import { IoMdTime } from 'react-icons/io';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';
import Topbar from './Topbar';
import Footer from './Footer';
import { getLocalCart, addToLocalCart, getLocalWishlist, addToLocalWishlist, removeFromLocalWishlist } from '../../utils/localCart';



const isVideo = (path) => {
    if (!path || typeof path !== 'string') return false;
    if (path.includes('#video')) return true;
    if (path.startsWith('data:video/')) return true;
    const cleanPath = path.split('?')[0].split('#')[0].toLowerCase();
    const ext = cleanPath.split('.').pop();
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', '3gp', '3gpp', '3gpp2', 'mpeg', 'flv', 'wmv'].includes(ext);
};

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
    const [expandedSection, setExpandedSection] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', reviewText: '', tags: [] });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const imageContainerRef = useRef(null);
    const isLoggedIn = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

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
                    isLoggedIn ? API.get('/wishlist') : Promise.resolve({ data: [] }),
                    isLoggedIn ? API.get('/cart') : Promise.resolve({ data: { items: [] } }),
                    isLoggedIn ? API.get(`/reviews/can-review/${id}`) : Promise.resolve({ data: { canReview: false } })
                ]);

                if (results[0].status === 'fulfilled') setProduct(results[0].value.data);
                else setError('Failed to load product.');

                if (results[1].status === 'fulfilled') {
                    const products = results[1].value.data.products || [];
                    setSimilarProducts(products.filter(p => p._id !== id).slice(0, 4));
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

                if (isLoggedIn) {
                    if (results[3]?.status === 'fulfilled' && results[3].value?.data) {
                        const wData = Array.isArray(results[3].value.data) ? results[3].value.data : [];
                        const ids = wData.map(i => i.productId?._id).filter(Boolean);
                        setIsInWishlist(ids.includes(id));
                    }

                    if (results[4]?.status === 'fulfilled' && results[4].value?.data) {
                        const cItems = results[4].value.data.items || [];
                        setIsInCart(cItems.some(i => (i.productId?._id || i.productId) === id));
                    }
                } else {
                    const localWish = getLocalWishlist();
                    const ids = localWish.map(i => i.productId?._id || i.productId).filter(Boolean);
                    setIsInWishlist(ids.includes(id));

                    const localCart = getLocalCart();
                    setIsInCart(localCart.some(i => (i.productId?._id || i.productId) === id));
                }

                if (results[5]?.status === 'fulfilled' && results[5].value?.data) {
                    setCanReview(!!results[5].value.data.canReview);
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
        if (isBuyNow) {
            if (!isLoggedIn) {
                try {
                    addToLocalCart(product, quantity);
                } catch (err) {
                    alert(err.message || 'Failed to add to cart.');
                    return;
                }
                navigate('/Login?redirect=/checkout');
                return;
            }
            navigate('/checkout', { state: { product, quantity } });
            return;
        }

        if (isInCart) return navigate('/Cart');

        try {
            if (!isLoggedIn) {
                addToLocalCart(product, quantity);
                setIsInCart(true);
                return;
            }
            await API.post('/cart/add', { productId: product._id, quantity });
            setIsInCart(true);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to add to cart.');
        }
    }, [isLoggedIn, isInCart, product, quantity, navigate]);

    const toggleWishlist = useCallback(async () => {
        if (togglingWishlist) return;
        setTogglingWishlist(true);
        try {
            if (!isLoggedIn) {
                if (isInWishlist) {
                    removeFromLocalWishlist(id);
                    setIsInWishlist(false);
                } else {
                    addToLocalWishlist(product);
                    setIsInWishlist(true);
                }
                return;
            }

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
    }, [isLoggedIn, isInWishlist, id, product, togglingWishlist]);

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
        if (!isLoggedIn) return navigate('/Login');
        try {
            await API.post(`/reviews/vote/${reviewId}`, { type });
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data);
        } catch (e) {
            console.error('Error voting review:', e);
            alert(e.response?.data?.message || 'Error voting review');
        }
    };

    const productImages = useMemo(() => {
        const valid = product?.images?.filter(img => img && typeof img === 'string' && img.trim() !== '');
        return valid?.length ? valid : [placeholderImg];
    }, [product]);

    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;
    const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    const inStock = (product?.stock || 0) > 0;

    const averageRating = useMemo(() => {
        if (!reviews.length) return '0.0';
        return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    }, [reviews]);





    if (loading) return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <div className="max-w-[1400px] mx-auto px-4 py-12 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-gray-50 rounded-3xl" />
                    <div className="space-y-6">
                        <div className="h-10 bg-gray-50 w-3/4 rounded-lg" />
                        <div className="h-6 bg-gray-50 w-1/4 rounded-lg" />
                        <div className="h-32 bg-gray-50 w-full rounded-2xl" />
                        <div className="h-16 bg-gray-900 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
            <MdInfoOutline className="text-gray-200 text-6xl mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase">Product Not Found</h2>
            <p className="text-gray-500 mb-8 max-sm">{error || "The item you're looking for isn't available right now."}</p>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full">Return Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            <Helmet>
                <title>{`${product.name} | Plenora Organic Skincare`}</title>
                <meta name="description" content={product.description?.slice(0, 160)} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description?.slice(0, 160)} />
                <meta property="og:image" content={productImages[0]} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={window.location.href} />
            </Helmet>
            <Topbar />

            <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 w-full">
                
                {/* --- BREADCRUMBS --- */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex-wrap">
                    <button onClick={() => navigate('/')} className="hover:text-black transition-colors">Home</button>
                    <FaChevronRight className="text-[8px]" />
                    <button onClick={() => navigate('/products')} className="hover:text-black transition-colors">Collection</button>
                    {product.category?.main && (
                        <>
                            <FaChevronRight className="text-[8px]" />
                            <button 
                                onClick={() => {
                                    const slug = product.category.main.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                    navigate(`/category/${slug}`);
                                }} 
                                className="hover:text-black transition-colors"
                            >
                                {product.category.main}
                            </button>
                        </>
                    )}
                    {product.category?.sub && (
                        <>
                            <FaChevronRight className="text-[8px]" />
                            <span className="text-gray-450">{product.category.sub}</span>
                        </>
                    )}
                    <FaChevronRight className="text-[8px]" />
                    <span className="text-black truncate max-w-[150px]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 mb-12">
                    
                    {/* --- LEFT: GALLERY SECTION --- */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-[#fdfaf7] border border-[#f3ece4] group shadow-sm">
                            {isVideo(productImages[selectedImage]) ? (
                                <video
                                    src={productImages[selectedImage]}
                                    className="w-full h-full object-cover transition-transform duration-700"
                                    controls
                                    muted
                                    playsInline
                                    autoPlay
                                    key={productImages[selectedImage]}
                                />
                            ) : (
                                <img
                                    src={productImages[selectedImage]}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={product.name}
                                />
                            )}
                            {discount > 0 && (
                                <div className="absolute top-6 left-6 bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                                    {discount}% OFF
                                </div>
                            )}
                            <button 
                                onClick={toggleWishlist}
                                className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all shadow-md group/wish"
                            >
                                {isInWishlist ? <FaHeart className="text-rose-500 text-xl" /> : <FaRegHeart className="text-xl group-hover/wish:scale-110" />}
                            </button>
                        </div>

                        {productImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {productImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                                            selectedImage === i ? 'border-[#8c6d45] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {isVideo(img) ? (
                                            <div className="w-full h-full relative bg-stone-100">
                                                <video src={img} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: CONTENT SECTION --- */}
                    <div className="flex flex-col">
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-100">
                                    {product.category?.main ? `${product.category.main}${product.category.sub ? ` > ${product.category.sub}` : ''}` : 'Organic Collection'}
                                </span>
                                <div className="h-px flex-1 bg-gray-100" />
                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-400 text-[11px]">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-200'} />
                                        ))}
                                    </div>
                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">{reviews.length} Reviews</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                    {product.name}
                                </h1>
                                <p className="text-gray-500 text-[16px] leading-relaxed font-medium max-w-xl">
                                    {product.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3.5xl font-black text-gray-900">₹{sellingPrice.toLocaleString()}</span>
                                    {mrp > sellingPrice && (
                                        <span className="text-xl text-gray-300 font-bold line-through">₹{mrp.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="px-2.5 py-1 bg-rose-50 text-rose-500 text-[11px] font-black uppercase tracking-wider border border-rose-100 rounded">
                                    Inclusive of all taxes
                                </div>
                            </div>
                        </div>

                        {/* Selection & Controls */}
                        <div className="relative p-6 lg:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] mb-6 overflow-hidden">
                            {/* Decorative gradient background element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#fdfaf7] rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                            
                            <div className="relative space-y-6">
                                <div className="flex flex-wrap items-end justify-between gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider block">Quantity</label>
                                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 w-fit">
                                            <button 
                                                onClick={() => handleQuantityChange('decrease')}
                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white hover:shadow-xs rounded-lg transition-all"
                                            >
                                                <FaMinus className="text-[10px]" />
                                            </button>
                                            <span className="w-10 text-center font-black text-sm text-gray-900">{quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityChange('increase')}
                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white hover:shadow-xs rounded-lg transition-all"
                                            >
                                                <FaPlus className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 text-right">
                                        <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider block">Status</label>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                                            inStock ? 'bg-emerald-50/50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${inStock ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            </span>
                                            {inStock ? `${product.stock} In Stock` : 'Sold Out'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => addToCartAction(false)}
                                        disabled={!inStock}
                                        className={`flex-1 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 ${
                                            isInCart 
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                            : 'bg-black text-white hover:bg-gray-800'
                                        } disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none`}
                                    >
                                        {isInCart ? <FaCheck className="text-base" /> : <FaShoppingBag className="text-base" />}
                                        {isInCart ? 'View In Cart' : 'Add To Bag'}
                                    </button>
                                    <button
                                        onClick={() => addToCartAction(true)}
                                        disabled={!inStock}
                                        className="flex-1 py-4 bg-[#8c6d45] hover:bg-[#725a3a] text-white rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                                    >
                                        <MdOutlineFlashOn className="text-lg" />
                                        Buy It Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Highlights */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            {[
                                "Made for Indian Skintone",
                                "No Harsh Chemicals",
                                "Gentle and Effective",
                                "Skin-Friendly Ingredients",
                                "No Harsh Preservatives",
                                "Parabens & Sulphate Free"
                            ].map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-[#fdfaf7] rounded-xl border border-[#f3ece4] hover:border-[#8c6d45]/40 transition-all duration-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
                                    <div className="w-5 h-5 rounded-full bg-[#8c6d45]/10 flex items-center justify-center text-[#8c6d45] shrink-0">
                                        <FaCheck className="text-[8px]" />
                                    </div>
                                    <span className="text-[11px] font-black text-gray-800 uppercase tracking-wider leading-snug">
                                        {badge}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* --- TABS SECTION --- */}
                <div className="border-t border-gray-100 pt-8">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6">
                        {['description', 'how-to-use', 'ingredients', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setExpandedSection(tab)}
                                className={`relative pb-3 text-[13px] font-black uppercase tracking-wider transition-all ${
                                    expandedSection === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.replace('-', ' ')}
                                {expandedSection === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8c6d45] rounded-full animate-fade-in" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-3xl mx-auto">
                        {expandedSection === 'description' && (
                            <div className="animate-fade-up space-y-2">
                                <h3 className="text-xl font-black text-gray-900 text-center mb-2">Product Story</h3>
                                <p className="text-gray-600 text-base leading-relaxed font-medium whitespace-pre-line text-center px-4">
                                    {product.description}
                                </p>
                                {(product.specifications?.length > 0 || product.displayWeight || product.productType) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        {product.displayWeight && (
                                            <div className="flex justify-between p-3 bg-[#fdfaf7] rounded-lg border border-[#f3ece4]">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Weight</span>
                                                <span className="text-xs font-bold text-gray-900">{product.displayWeight}</span>
                                            </div>
                                        )}
                                        {product.productType && (
                                            <div className="flex justify-between p-3 bg-[#fdfaf7] rounded-lg border border-[#f3ece4]">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                                                <span className="text-xs font-bold text-gray-900">{product.productType}</span>
                                            </div>
                                        )}
                                        {product.specifications?.map((spec, i) => (
                                            <div key={i} className="flex justify-between p-3 bg-[#fdfaf7] rounded-lg border border-[#f3ece4]">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{spec.key}</span>
                                                <span className="text-xs font-bold text-gray-900">{spec.value} {spec.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {expandedSection === 'how-to-use' && (
                            <div className="animate-fade-up text-center space-y-4">
                                <h3 className="text-xl font-black text-gray-900">Application Guide</h3>
                                {product.howToUse ? (
                                    <p className="text-gray-600 text-base leading-relaxed font-medium whitespace-pre-line text-center px-4 max-w-3xl mx-auto">
                                        {product.howToUse}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                                        {[
                                            { step: "01", title: "Cleanse", text: "Wash your face with a mild cleanser and pat dry." },
                                            { step: "02", title: "Apply", text: "Take a small amount and apply evenly across the area." },
                                            { step: "03", title: "Massage", text: "Gently massage in circular motions until absorbed." }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="text-3xl font-black text-gray-100">{item.step}</div>
                                                <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{item.title}</h4>
                                                <p className="text-[12px] text-gray-500 leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {expandedSection === 'ingredients' && (
                            <div className="animate-fade-up space-y-6">
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-black text-gray-900">Nature's Best</h3>
                                    <p className="text-gray-500 max-w-lg mx-auto text-[11px] leading-relaxed px-4">We believe in transparency. Here's exactly what goes into your product.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 px-4">
                                    {product.ingredients ? (
                                        product.ingredients.split(',').map((ing, i) => (
                                            <div key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-600 shadow-xs hover:shadow-sm hover:border-[#8c6d45] transition-all cursor-default">
                                                {ing.trim()}
                                            </div>
                                        ))
                                    ) : (
                                        ['Aloe Vera', 'Vitamin E', 'Organic Jojoba', 'Rosehip Oil', 'Hyaluronic Acid', 'Glycerin'].map((ing, i) => (
                                            <div key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-600 shadow-xs hover:shadow-sm hover:border-[#8c6d45] transition-all cursor-default">
                                                {ing}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {expandedSection === 'reviews' && (
                            <div className="animate-fade-up space-y-6">
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#f3ece4]">
                                    <div className="text-center space-y-1">
                                        <div className="text-5xl font-black text-gray-900">{averageRating}</div>
                                        <div className="flex text-amber-400 text-lg justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-100'} />
                                            ))}
                                        </div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{reviews.length} reviews</div>
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-1.5">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = reviews.filter(r => r.rating === star).length;
                                            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-gray-400 w-3">{star}★</span>
                                                    <div className="flex-1 h-1 bg-white rounded-full overflow-hidden border border-[#f3ece4]">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-400 w-6">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        onClick={() => setShowReviewForm(true)}
                                        className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-lg"
                                    >
                                        Write Review
                                    </button>
                                </div>

                                <div className="space-y-3 px-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((r) => (
                                            <div key={r._id} className="p-5 bg-white border border-gray-100 rounded-2xl space-y-2 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <div className="flex text-amber-400 text-[9px]">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < r.rating ? 'fill-current' : 'text-gray-100'} />
                                                            ))}
                                                        </div>
                                                        <h4 className="font-black text-gray-900 text-[12px] uppercase tracking-wider">{r.title}</h4>
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[12px] text-gray-600 leading-relaxed font-medium italic">"{r.reviewText}"</p>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                    <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{r.customerId?.name || 'Verified Buyer'}</span>
                                                    <div className="flex items-center gap-3 text-gray-400">
                                                        <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors" onClick={() => handleVote(r._id, 'up')}><FaThumbsUp className="text-[9px]" /> {r.helpfulVotes?.up || 0}</button>
                                                        <button className="flex items-center gap-1 hover:text-rose-600 transition-colors" onClick={() => handleVote(r._id, 'down')}><FaThumbsDown className="text-[9px]" /> {r.helpfulVotes?.down || 0}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <FaStar className="text-3xl text-gray-200 mx-auto mb-2" />
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No reviews yet. Share your experience!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SIMILAR PRODUCTS --- */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 mb-8">
                        <div className="flex items-end justify-between mb-6 px-4">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Complete Your Routine</h2>
                                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Pairs perfectly with your selection.</p>
                            </div>
                            <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-[#8c6d45] transition-colors group">
                                Collection <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                            {similarProducts.map((p) => (
                                <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="group cursor-pointer">
                                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-[#fdfaf7] border border-[#f3ece4] mb-4 shadow-xs group-hover:shadow-lg transition-all duration-500">
                                        {p.images?.[0] && /\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/i.test(p.images[0]) ? (
                                            <video
                                                src={p.images[0]}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={p.images?.[0] || placeholderImg}
                                                alt={p.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = placeholderImg;
                                                }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg scale-50 group-hover:scale-100 transition-transform">
                                                <FaShoppingBag className="text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 px-1">
                                        <h3 className="font-black text-gray-900 text-[11px] uppercase tracking-wider group-hover:text-[#8c6d45] transition-colors line-clamp-1">{p.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-gray-900 text-sm">₹{p.pricing?.selling_price.toLocaleString()}</span>
                                            <div className="flex items-center gap-1 text-amber-400 text-[7px]">
                                                <FaStar /> <span className="text-gray-400 font-black">4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* --- FIXED MOBILE BAR --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 lg:hidden z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex gap-3 max-w-md mx-auto">
                    <button
                        onClick={() => addToCartAction(false)}
                        disabled={!inStock}
                        className={`flex-1 h-14 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${
                            isInCart 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-white border-black text-black'
                        } disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-300`}
                    >
                        {isInCart ? <FaCheck /> : <FaShoppingBag />} {isInCart ? 'In Bag' : 'Add To Bag'}
                    </button>
                    <button
                        onClick={() => addToCartAction(true)}
                        disabled={!inStock}
                        className="flex-[1.5] h-14 bg-[#8c6d45] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#8c6d45]/20 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                    >
                        <MdOutlineFlashOn className="text-xl" />
                        Buy Now
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Productview;
