import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaExclamationCircle, FaTag, FaCheckCircle } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';
import { getLocalCart, addToLocalCart } from '../../utils/localCart';

const defaultFilters = {};

const Products = ({ filters = defaultFilters }) => {
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [togglingWishlist, setTogglingWishlist] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [prevFilters, setPrevFilters] = useState(filters);

    const isLoggedIn = useMemo(() => {
        return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            const filtersChanged = JSON.stringify(prevFilters) !== JSON.stringify(filters);
            const targetPage = filtersChanged ? 1 : currentPage;

            if (filtersChanged) {
                setPrevFilters(filters);
                setCurrentPage(1);
            }

            if (targetPage === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                // Build query parameters from filters
                const queryParams = new URLSearchParams();
                queryParams.append('page', targetPage);

                // Check if any filters are active
                const hasActiveFilters =
                    (filters.categories && filters.categories.length > 0) ||
                    (filters.subCategories && filters.subCategories.length > 0) ||
                    filters.category ||
                    filters.subCategory ||
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

                    if (filters.subCategories && filters.subCategories.length > 0) {
                        queryParams.append('subCategories', filters.subCategories.join(','));
                    } else if (filters.subCategory) {
                        queryParams.append('subCategory', filters.subCategory);
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
                    productsPromise = API.get(`/products/customer/page?page=${targetPage}`);
                }

                const promises = [productsPromise];
                if (isLoggedIn) {
                    promises.push(API.get('/wishlist'));
                    promises.push(API.get('/cart'));
                }

                const results = await Promise.allSettled(promises);

                if (results[0].status === 'fulfilled') {
                    const newProducts = results[0].value.data.products || [];
                    setProducts(prev => targetPage === 1 ? newProducts : [...prev, ...newProducts]);
                    setTotalPages(results[0].value.data.totalPages || 1);
                    setError('');
                } else {
                    setError('Failed to load products. Please try again later.');
                    if (targetPage === 1) {
                        setProducts([]);
                    }
                }

                if (isLoggedIn) {
                    if (results[1]?.status === 'fulfilled') {
                        const wishlistProductIds = (Array.isArray(results[1].value.data) ? results[1].value.data : [])
                            .filter(item => item?.productId?._id)
                            .map(item => item.productId._id);
                        setWishlistItems(wishlistProductIds);
                    }

                    if (results[2]?.status === 'fulfilled') {
                        setCartItems(results[2].value.data.items || []);
                    }
                } else {
                    const localItems = getLocalCart();
                    setCartItems(localItems);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
                setLoadingMore(false);
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

        setAddingToCart(productId);

        try {
            const productObj = products.find(p => p._id === productId);
            if (!isLoggedIn) {
                if (productObj) {
                    addToLocalCart(productObj, 1);
                    showNotification('Added to cart successfully!', 'success');
                    setCartItems(getLocalCart());
                }
                return;
            }

            await API.post('/cart/add', {
                productId: productId.toString(),
                quantity: 1
            });

            showNotification('Added to cart successfully!', 'success');

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Add to cart error:', error);
            showNotification(error.response?.data?.message || error.message || 'Failed to add to cart', 'error');
        } finally {
            setAddingToCart(null);
        }
    };

    const ProductCard = useCallback(({ product }) => {
        const inCart = isInCart(product._id);
        const availablePieces = product.stock || 0;
        const sellingPrice = product.pricing?.selling_price || 0;
        const mrp = product.pricing?.mrp || 0;
        const discount = mrp > sellingPrice ? (product.pricing?.discount_percentage || 0) : 0;

        // Mock colors for finishes
        const finishes = [
            { name: '18K Yellow Gold', hex: '#dfb76c' },
            { name: 'Rose Gold', hex: '#e8c3ba' },
            { name: 'Sterling Silver', hex: '#e2e2e2' }
        ];

        return (
            <div
                onClick={() => handleProductClick(product._id)}
                className="bg-transparent rounded-[12px] overflow-hidden hover:shadow-lg sm:hover:-translate-y-1 transition-all duration-350 cursor-pointer active:scale-98 animate-fade-in flex flex-col h-full group w-full"
            >
                {/* Image & Background Section */}
                <div className="relative w-full aspect-[1/1.05] sm:aspect-[4/4.5] overflow-hidden flex-shrink-0 flex flex-col bg-[#F9F9F9] rounded-[16px]">
                    
                    {/* Top Badge */}
                    <div className="absolute top-0 left-0 w-full z-20">
                        {discount > 0 ? (
                            <div className="w-full text-center py-1 sm:py-1.5 text-[11px] font-bold text-white bg-[#A1BC60] uppercase tracking-wide">
                                FLAT {Math.round(discount)}% OFF
                            </div>
                        ) : product.category?.main === 'Best Seller' || product.isBestSeller ? (
                            <div className="inline-block bg-[#680b0b] text-white px-3 py-1 font-bold text-[11px] rounded-br-[12px] shadow-sm">
                                Best Seller
                            </div>
                        ) : null}
                    </div>

                    {/* Product Image or Video */}
                    <div className="flex-1 w-full h-full z-10 relative">
                        {product.images?.[0] && /\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/i.test(product.images[0]) ? (
                            <video
                                src={product.images[0]}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={product.images?.[0] || placeholderImg}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = placeholderImg;
                                }}
                            />
                        )}
                    </div>

                    {availablePieces <= 0 && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                            <span className="text-stone-800 font-bold px-4 py-2 bg-white rounded-md text-[12px] uppercase tracking-widest shadow-md">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="pt-3 sm:pt-4 pb-1 flex-1 flex flex-col bg-transparent">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <FaStar className="text-[#F5A623] w-3.5 h-3.5" />
                        <span className="text-[12px] sm:text-[13px] font-bold text-[#333]">
                            {product.rating || "4.8"}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] sm:text-[16px] md:text-[17px] font-bold text-[#111] line-clamp-2 leading-snug mb-1 font-serif">
                        {product.name}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-[12px] sm:text-[13px] text-[#666] line-clamp-1 mb-3 font-sans">
                        {product.shortDescription || (product.category?.main ? `${product.category.main}${product.category.sub ? ` - ${product.category.sub}` : ''}` : (typeof product.category === 'string' ? product.category : "Best Seller"))}
                    </p>

                    {/* Price and Cart Button */}
                    <div className="flex flex-col mt-auto gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[18px] sm:text-[20px] font-bold text-[#111] tracking-tight">₹{sellingPrice.toFixed(0)}</span>
                            {mrp > sellingPrice && (
                                <span className="text-[13px] sm:text-[14px] text-gray-400 font-medium line-through">₹{mrp.toFixed(0)}</span>
                            )}
                        </div>

                        {inCart ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 bg-[#A1BC60] text-white transition-all duration-350 text-[14px] sm:text-[15px] font-bold rounded-[10px] shadow-sm cursor-pointer font-sans"
                            >
                                In Cart
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                disabled={addingToCart === product._id || availablePieces <= 0}
                                className={`w-full flex items-center justify-center px-4 py-2.5 sm:py-3 transition-all duration-350 text-[14px] sm:text-[15px] font-bold rounded-[10px] shadow-sm cursor-pointer font-sans ${
                                    addingToCart === product._id || availablePieces <= 0
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                        : 'bg-[#A1BC60] hover:bg-[#8da84c] text-white'
                                }`}
                            >
                                {addingToCart === product._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    'Add To Cart'
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-transparent rounded-2xl overflow-hidden p-2 sm:p-4 animate-pulse">
                                <Skeleton className="w-full aspect-[4/4.5] mb-4 bg-cream-base rounded-[16px]" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-1/4 bg-cream-base" />
                                    <Skeleton className="h-5 w-3/4 bg-cream-base" />
                                    <Skeleton className="h-4 w-1/2 bg-cream-base" />
                                    <div className="pt-2 flex flex-col gap-2">
                                        <Skeleton className="h-6 w-20 bg-cream-base" />
                                        <Skeleton className="h-10 w-full bg-cream-base rounded-lg" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="w-full h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && currentPage < totalPages && (
                    <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:mt-12">
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 font-bold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md flex items-center gap-2.5 rounded-xs cursor-pointer"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Loading More Essentials...
                                </>
                            ) : (
                                "Load More Products"
                            )}
                        </button>
                        <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest font-outfit mt-1">
                            Showing {products.length} Products
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;