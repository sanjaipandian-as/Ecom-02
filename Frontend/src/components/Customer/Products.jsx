import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaExclamationCircle, FaTag, FaCheckCircle } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

const defaultFilters = {};

const Products = ({ filters = defaultFilters }) => {
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [togglingWishlist, setTogglingWishlist] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cartItems, setCartItems] = useState([]);

    const isLoggedIn = useMemo(() => {
        return !!localStorage.getItem('token');
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Build query parameters from filters
                const queryParams = new URLSearchParams();
                queryParams.append('page', currentPage);

                // Check if any filters are active
                const hasActiveFilters =
                    (filters.categories && filters.categories.length > 0) ||
                    filters.category ||
                    (filters.sortBy && filters.sortBy !== 'relevance') ||
                    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000)) ||
                    (filters.selectedBrands && filters.selectedBrands.length > 0) ||
                    (filters.selectedAges && filters.selectedAges.length > 0) ||
                    (filters.selectedTags && filters.selectedTags.length > 0) ||
                    (filters.selectedRatings && filters.selectedRatings.length > 0) ||
                    filters.isEcoFriendly ||
                    filters.isGreenCrackers;

                let productsPromise;

                if (hasActiveFilters) {
                    // Use filter endpoint
                    if (filters.categories && filters.categories.length > 0) {
                        queryParams.append('categories', filters.categories.join(','));
                    } else if (filters.category) {
                        queryParams.append('category', filters.category);
                    }

                    if (filters.sortBy && filters.sortBy !== 'relevance') {
                        queryParams.append('sortBy', filters.sortBy);
                    }

                    if (filters.priceRange) {
                        queryParams.append('minPrice', filters.priceRange[0]);
                        queryParams.append('maxPrice', filters.priceRange[1]);
                    }

                    if (filters.selectedBrands && filters.selectedBrands.length > 0) {
                        queryParams.append('brands', filters.selectedBrands.join(','));
                    }

                    if (filters.selectedAges && filters.selectedAges.length > 0) {
                        queryParams.append('ageCategories', filters.selectedAges.join(','));
                    }

                    if (filters.selectedTags && filters.selectedTags.length > 0) {
                        queryParams.append('tags', filters.selectedTags.join(','));
                    }

                    if (filters.selectedRatings && filters.selectedRatings.length > 0) {
                        const minRating = Math.min(...filters.selectedRatings);
                        queryParams.append('minRating', minRating);
                    }

                    if (filters.isEcoFriendly) {
                        queryParams.append('isEcoFriendly', 'true');
                    }

                    if (filters.isGreenCrackers) {
                        queryParams.append('isGreenCrackers', 'true');
                    }

                    productsPromise = API.get(`/products/customer/filter?${queryParams.toString()}`);
                } else {
                    // Use regular pagination endpoint
                    productsPromise = API.get(`/products/customer/page?page=${currentPage}`);
                }

                const promises = [productsPromise];
                if (isLoggedIn) {
                    promises.push(API.get('/wishlist'));
                    promises.push(API.get('/cart'));
                }

                const results = await Promise.allSettled(promises);

                if (results[0].status === 'fulfilled') {
                    setProducts(results[0].value.data.products || []);
                    setTotalPages(results[0].value.data.totalPages || 1);
                    setError('');
                } else {
                    setError('Failed to load products. Please try again later.');
                    setProducts([]);
                }

                if (results[1]?.status === 'fulfilled') {
                    const wishlistProductIds = (Array.isArray(results[1].value.data) ? results[1].value.data : [])
                        .filter(item => item?.productId?._id)
                        .map(item => item.productId._id);
                    setWishlistItems(wishlistProductIds);
                }

                if (results[2]?.status === 'fulfilled') {
                    setCartItems(results[2].value.data.items || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [currentPage, isLoggedIn, filters]);

    const isInCart = useCallback((productId) => {
        return cartItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const getCartItem = useCallback((productId) => {
        return cartItems.find(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            showNotification('Please login to add items to wishlist', 'error');
            setTimeout(() => navigate('/Login'), 1500);
            return;
        }

        setTogglingWishlist(productId);

        try {
            const isInWishlist = wishlistItems.includes(productId);

            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${productId}`);
                setWishlistItems(prev => prev.filter(id => id !== productId));
                showNotification('Removed from wishlist', 'success');
            } else {
                await API.post('/wishlist/add', { productId });
                setWishlistItems(prev => [...prev, productId]);
                showNotification('Added to wishlist!', 'success');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again', 'error');
                setTimeout(() => navigate('/Login'), 1500);
            } else if (error.response?.status === 400 && error.response?.data?.message === 'Already in wishlist') {
                setWishlistItems(prev => [...prev, productId]);
                showNotification('Already in wishlist', 'success');
            } else {
                showNotification(error.response?.data?.message || 'Failed to update wishlist', 'error');
            }
        } finally {
            setTogglingWishlist(null);
        }
    };

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    }, []);

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            showNotification('Please login to add items to cart', 'error');
            setTimeout(() => navigate('/Login'), 1500);
            return;
        }

        setAddingToCart(productId);

        try {
            await API.post('/cart/add', {
                productId: productId.toString(),
                quantity: 1
            });

            showNotification('Added to cart successfully!', 'success');

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Add to cart error:', error);
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again', 'error');
                setTimeout(() => navigate('/Login'), 1500);
            } else {
                showNotification(error.response?.data?.message || 'Failed to add to cart', 'error');
            }
        } finally {
            setAddingToCart(null);
        }
    };

    const ProductCard = useCallback(({ product }) => {
        const inCart = isInCart(product._id);
        const availablePieces = product.stock || 0;
        const sellingPrice = product.pricing?.selling_price || 0;
        const mrp = product.pricing?.mrp;
        const discount = product.pricing?.discount_percentage || 0;

        // Mock colors for finishes
        const finishes = [
            { name: '18K Yellow Gold', hex: '#dfb76c' },
            { name: 'Rose Gold', hex: '#e8c3ba' },
            { name: 'Sterling Silver', hex: '#e2e2e2' }
        ];

        return (
            <div
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-[16px] overflow-hidden hover:shadow-lg sm:hover:-translate-y-1 transition-all duration-350 border border-gold-champagne/15 cursor-pointer active:scale-98 animate-fade-in flex flex-col h-full group w-full"
            >
                {/* Image & Background Section */}
                <div className="relative w-full aspect-square sm:aspect-[4/4.5] overflow-hidden flex-shrink-0 flex flex-col bg-white border-b border-gold-champagne/10">
                    
                    {/* Top Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        {discount > 0 ? (
                            <span className="px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-white bg-luxury-crimson rounded-xs shadow-xs uppercase">
                                SALE
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-emerald-deep bg-gold-champagne/30 rounded-xs shadow-xs uppercase">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Product Image */}
                    <div className="flex-1 w-full h-full z-10 relative">
                        <img
                            src={(product.images?.filter(img => img && img.trim() !== '')?.[0]) || placeholderImg}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholderImg;
                            }}
                        />
                    </div>

                    {availablePieces <= 0 && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                            <span className="text-stone-800 font-bold px-4 py-2 bg-white rounded-xs text-[11px] uppercase tracking-widest shadow-md">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <div>
                        {/* Material Finishes */}
                        <div className="flex items-center gap-1 mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gold-lustrous mr-1">Finishes:</span>
                            {finishes.map((f, i) => (
                                <div key={i} className="w-2.5 h-2.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: f.hex }} title={f.name}></div>
                            ))}
                        </div>

                        {/* Title */}
                        <h3 className="text-[14px] sm:text-[15px] font-medium text-stone-850 line-clamp-2 leading-snug mb-4 font-serif">
                            {product.name}
                        </h3>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="flex items-center justify-between pt-2 mt-auto">
                        <div className="flex flex-col">
                            {mrp > sellingPrice && (
                                <span className="text-[10px] text-gray-400 font-medium line-through font-outfit">₹{mrp.toFixed(0)}</span>
                            )}
                            <span className="text-base font-bold text-stone-900 tracking-tight font-outfit">₹{sellingPrice.toFixed(0)}</span>
                        </div>

                        {inCart ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                className="flex items-center justify-center px-4 py-1.5 bg-emerald-deep text-white hover:bg-gold-lustrous transition-all duration-350 text-[10px] font-bold uppercase tracking-wider rounded-xs shadow-xs cursor-pointer"
                            >
                                <span className="text-[10px] font-bold tracking-wide">In Bag</span>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                disabled={addingToCart === product._id || availablePieces <= 0}
                                className={`flex items-center justify-center px-4 py-1.5 transition-all duration-350 text-[10px] font-bold uppercase tracking-wider rounded-xs shadow-xs cursor-pointer ${
                                    addingToCart === product._id || availablePieces <= 0
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                        : 'bg-white border border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-white'
                                }`}
                            >
                                {addingToCart === product._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                    'Add to Bag'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [isInCart, handleProductClick, handleAddToCart, addingToCart, navigate]);

    return (
        <div className="w-full pb-20 md:pb-16 pt-2 md:pt-4 bg-cream-soft">

            {notification.show && (
                <div className={`fixed top-16 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg transform transition-all ${notification.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? (
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    ) : (
                        <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm sm:text-base">{notification.message}</span>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gold-champagne/15 p-3 sm:p-4 animate-pulse">
                                <Skeleton className="w-full aspect-[4/4.5] mb-4 bg-cream-base" />
                                <div className="space-y-3">
                                    <Skeleton className="h-5 w-3/4 bg-cream-base" />
                                    <Skeleton className="h-4 w-1/2 bg-cream-base" />
                                    <div className="pt-3 border-t border-gold-champagne/10 flex justify-between items-center">
                                        <Skeleton className="h-6 w-20 bg-cream-base" />
                                        <Skeleton className="h-8 w-24 bg-cream-base" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
                        <FaExclamationCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4" />
                        <p className="text-gray-600 text-base sm:text-lg text-center">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-pink-600 text-white text-sm sm:text-base rounded-lg hover:bg-pink-500 transition-all active:scale-95"
                        >
                            Retry
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                        <p className="text-gray-600 text-base sm:text-lg">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="w-full h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 sm:mt-12">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2.5 bg-white border border-gold-champagne/40 rounded-xs font-semibold text-xs text-stone-700 hover:border-gold-lustrous hover:text-gold-lustrous transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-stone-600 font-semibold text-xs uppercase tracking-widest font-outfit">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2.5 bg-white border border-gold-champagne/40 rounded-xs font-semibold text-xs text-stone-700 hover:border-gold-lustrous hover:text-gold-lustrous transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;