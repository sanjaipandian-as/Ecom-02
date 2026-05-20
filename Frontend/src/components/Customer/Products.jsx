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
                    filters.category ||
                    (filters.sortBy && filters.sortBy !== 'relevance') ||
                    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000)) ||
                    (filters.selectedBrands && filters.selectedBrands.length > 0) ||
                    (filters.selectedAges && filters.selectedAges.length > 0) ||
                    (filters.selectedTags && filters.selectedTags.length > 0) ||
                    (filters.selectedRatings && filters.selectedRatings.length > 0) ||
                    filters.isEcoFriendly ||
                    filters.isGreenCrackers;

                let productsPromise;

                if (hasActiveFilters) {
                    // Use filter endpoint
                    if (filters.category) {
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

        // Mock colors for design
        const colors = [
            ['bg-[#a3c4d3]', 'bg-[#8c9ca8]', 'bg-[#708c76]'],
            ['bg-[#cdd3a3]', 'bg-[#8c9ca8]', 'bg-[#d68a60]'],
            ['bg-[#d3b4a3]', 'bg-[#8ca8a4]', 'bg-[#708c76]']
        ];
        const randomColors = colors[product.name.length % 3];

        return (
            <div
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-[16px] overflow-hidden hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer active:scale-98 animate-fadeIn flex flex-col h-full group w-full"
            >
                {/* Image & Background Section */}
                <div className="relative w-full aspect-square sm:aspect-[4/4.5] overflow-hidden flex-shrink-0 p-4 flex flex-col" style={{ background: 'linear-gradient(to bottom, #dfdcd5, #f2efeb)' }}>
                    
                    {/* Top Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="px-4 py-1.5 rounded-full border border-white/80 text-white text-[11px] font-medium tracking-wide shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                            {discount > 0 ? 'Promotion' : 'New'}
                        </span>
                    </div>

                    {/* Product Image */}
                    <div className="flex-1 w-full h-full flex items-center justify-center p-4 z-10 relative">
                        <img
                            src={(product.images?.filter(img => img && img.trim() !== '')?.[0]) || placeholderImg}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholderImg;
                            }}
                        />
                    </div>

                    {availablePieces <= 0 && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                            <span className="text-gray-800 font-bold px-4 py-2 bg-white rounded-full text-[12px] sm:text-sm uppercase tracking-widest shadow-md">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white border-t border-gray-100">
                    <div>
                        {/* Color Swatches */}
                        <div className="flex items-center gap-1.5 mb-3">
                            {randomColors.map((color, i) => (
                                <div key={i} className={`w-3.5 h-3.5 rounded-full ${color} border border-gray-200 shadow-sm`}></div>
                            ))}
                        </div>

                        {/* Title */}
                        <h3 className="text-[14px] sm:text-[15px] font-medium text-gray-800 line-clamp-2 leading-snug mb-4">
                            {product.name}
                        </h3>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="flex items-center justify-between pt-2 mt-auto">
                        <div className="flex flex-col">
                            {mrp > sellingPrice && (
                                <span className="text-[11px] text-gray-400 font-medium line-through">₹{mrp.toFixed(0)}</span>
                            )}
                            <span className="text-[16px] sm:text-[17px] font-bold text-[#2E2E2E] tracking-tight">₹{sellingPrice.toFixed(2)}</span>
                        </div>

                        {inCart ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#81C784] text-white rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                <span className="text-[13px] font-medium tracking-wide">In Cart</span>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                disabled={addingToCart === product._id || availablePieces <= 0}
                                className={`flex items-center gap-1 px-4 py-1.5 text-white rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 ${addingToCart === product._id || availablePieces <= 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#1a382e] hover:bg-[#122b22] cursor-pointer'
                                    }`}
                            >
                                {addingToCart === product._id ? (
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <span className="text-[14px] font-medium leading-none mb-0.5">+</span>
                                        <span className="text-[12px] font-medium tracking-wide">Cart</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [isInCart, handleProductClick, handleAddToCart, addingToCart, navigate]);

    return (
        <div className="w-full pb-20 md:pb-16 pt-2 md:pt-4" style={{ background: '#FFFDFD' }}>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-3 sm:p-4">
                                <Skeleton className="w-full aspect-[4/3] mb-4" />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-10" />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <div className="space-y-2 flex flex-col items-end">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                        <Skeleton className="h-10 w-24" />
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
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-base text-gray-700 hover:border-pink-600 hover:text-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 active:scale-95"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-semibold text-sm sm:text-base">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-base text-gray-700 hover:border-pink-600 hover:text-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 active:scale-95"
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