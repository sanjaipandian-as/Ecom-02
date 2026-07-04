import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../../api';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import { FaArrowLeft, FaShoppingCart, FaStar, FaHeart, FaCheckCircle } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import placeholderImg from "../../../assets/Placeholder.png";

// Memoized Product Card Component for better performance
const ProductCard = React.memo(({
    product,
    inCart,
    inWishlist,
    addingToCart,
    addingToWishlist,
    onProductClick,
    onAddToCart,
    onAddToWishlist
}) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group">
            {/* Product Image */}
            <div
                className="aspect-square relative overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => onProductClick(product._id)}
            >
                <img
                    src={product.images?.find(img => img && img.trim() !== '' && !/\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/i.test(img)) || product.images?.[0] || placeholderImg}
                    alt={product.name}
                    loading="lazy" // Lazy load images for better performance
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = placeholderImg;
                        e.target.onerror = null;
                    }}
                />
                {product.pricing?.discount_percentage > 0 && product.pricing?.mrp > product.pricing?.selling_price && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                        {product.pricing.discount_percentage}% OFF
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToWishlist(product);
                    }}
                    disabled={addingToWishlist === product._id}
                    className={`absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${inWishlist
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-primary'
                        }`}
                >
                    {addingToWishlist === product._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary"></div>
                    ) : (
                        <FaHeart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    )}
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <h3
                    className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base md:text-lg cursor-pointer hover:text-primary transition-colors leading-relaxed"
                    onClick={() => onProductClick(product._id)}
                >
                    {product.name}
                </h3>

                {/* Category and Brand */}
                <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Category</p>
                        <p className="font-semibold text-gray-700 text-sm">{product.category?.sub ? `${product.category.main} - ${product.category.sub}` : (product.category?.main || product.category || 'Uncategorized')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Brand</p>
                        <p className="font-semibold text-primary text-sm">{product.brand}</p>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <FaStar className="w-4 h-4 text-secondary" />
                    <span className="text-base font-semibold text-gray-700">4.2</span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
                            ₹{product.pricing?.selling_price?.toLocaleString('en-IN') || '0'}
                        </span>
                        {product.pricing?.mrp && product.pricing?.mrp > product.pricing?.selling_price && (
                            <div className="text-sm text-gray-500 line-through mt-0.5">
                                ₹{product.pricing?.mrp?.toLocaleString('en-IN') || '0'}
                            </div>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={
                            addingToCart === product._id ||
                            (product.stock || 0) <= 0
                        }
                        className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${(product.stock || 0) <= 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : inCart
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {addingToCart === product._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        ) : (product.stock || 0) <= 0 ? (
                            <span className="text-xs">Out of Stock</span>
                        ) : inCart ? (
                            <>
                                <FaShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">View Cart</span>
                                <span className="sm:hidden text-xs">Cart</span>
                            </>
                        ) : (
                            <>
                                <FaShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

const CategoriesSpecificpage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Cart and Wishlist states
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [addingToCart, setAddingToCart] = useState(null);
    const [addingToWishlist, setAddingToWishlist] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        priceRange: [0, 10000000],
        selectedBrands: [],
        selectedAges: [],
        selectedTags: [],
        selectedRatings: [],
        isEcoFriendly: false,
        isGreenCrackers: false
    });

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000);
    const [categories, setCategories] = useState([]);

    // Fetch filter options for Sidebar
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await API.get('/products/customer/filter-options');
                const data = response.data;
                setCategories(data.categories || []);
                setMinPrice(data.priceRange?.min || 0);
                setMaxPrice(data.priceRange?.max || 10000000);
                
                // Also update the initial filters state to match real bounds
                setFilters(prev => ({
                    ...prev,
                    priceRange: [data.priceRange?.min || 0, data.priceRange?.max || 10000000]
                }));
            } catch (err) {
                console.error('Error fetching filter options:', err);
            }
        };
        fetchFilterOptions();
    }, []);

    // Fetch cart and wishlist on mount
    useEffect(() => {
        fetchCart();
        fetchWishlist();
    }, []);

    // Fetch products for this category
    useEffect(() => {
        fetchProducts();
    }, [categorySlug, currentPage, filters]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/wishlist');
            setWishlistItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 50, // Show 50 products per page for better performance
                minPrice: filters.priceRange[0],
                maxPrice: filters.priceRange[1],
            };

            // Add category filter
            if (filters.categories && filters.categories.length > 0) {
                params.categories = filters.categories.join(',');
            } else if (categorySlug && categorySlug !== 'bestsellers') {
                params.mainCategory = categorySlug;
            }

            // Add subcategory filter
            if (filters.subCategories && filters.subCategories.length > 0) {
                params.subCategories = filters.subCategories.join(',');
            }

            // Bestsellers category filter integration
            if (categorySlug === 'bestsellers') {
                params.showInTopSelling = 'true';
            }

            // Add brand filters
            if (filters.selectedBrands?.length > 0) {
                params.brands = filters.selectedBrands.join(',');
            }

            // Add age filters
            if (filters.selectedAges?.length > 0) {
                params.ageCategories = filters.selectedAges.join(',');
            }

            // Add tag filters
            if (filters.selectedTags?.length > 0) {
                params.tags = filters.selectedTags.join(',');
            }

            // Add rating filter
            if (filters.selectedRatings?.length > 0) {
                params.minRating = Math.min(...filters.selectedRatings);
            }

            // Add eco-friendly and green crackers filters
            if (filters.isEcoFriendly) {
                params.isEcoFriendly = 'true';
            }

            if (filters.isGreenCrackers) {
                params.isGreenCrackers = 'true';
            }

            const response = await API.get('/products/customer/filter', { params });

            setProducts(response.data.products || []);
            setTotalProducts(response.data.totalProducts || 0);
            setTotalPages(response.data.totalPages || 1);

            // Get category name from first product or format from slug
            if (categorySlug === 'bestsellers') {
                setCategoryName('Bestsellers');
            } else if (response.data.products && response.data.products.length > 0) {
                setCategoryName(response.data.products[0].category?.main || response.data.products[0].category || 'Category');
            } else {
                // Format category name from slug
                const formattedName = categorySlug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                setCategoryName(formattedName);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(1);
            // Format category name from slug as fallback
            const formattedName = categorySlug === 'bestsellers'
                ? 'Bestsellers'
                : categorySlug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            setCategoryName(formattedName);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const addToCart = useCallback(async (product) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        // Check if product is already in cart
        const isInCart = cartItems.some(item =>
            (item.productId?._id || item.productId) === product._id
        );

        if (isInCart) {
            navigate('/Cart');
            return;
        }

        setAddingToCart(product._id);
        try {
            await API.post('/cart/add', {
                productId: product._id,
                quantity: 1
            });
            fetchCart(); // Refresh cart items
        } catch (error) {
            console.error('Add to cart error:', error);
        } finally {
            setAddingToCart(null);
        }
    }, [cartItems, navigate]);

    const addToWishlist = useCallback(async (product) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        // Check if product is already in wishlist
        const isInWishlist = wishlistItems.some(item =>
            item.productId?._id === product._id
        );

        if (isInWishlist) {
            navigate('/Wishlist');
            return;
        }

        setAddingToWishlist(product._id);
        try {
            await API.post('/wishlist/add', {
                productId: product._id
            });
            fetchWishlist(); // Refresh wishlist items
        } catch (error) {
            console.error('Add to wishlist error:', error);
        } finally {
            setAddingToWishlist(null);
        }
    }, [wishlistItems, navigate]);

    // Memoize cart and wishlist checks for better performance
    const isInCart = useCallback((productId) => {
        return cartItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const isInWishlist = useCallback((productId) => {
        return wishlistItems.some(item =>
            item.productId?._id === productId
        );
    }, [wishlistItems]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Topbar />

            {/* Main Content with Sidebar */}
            <div className="flex-1 w-full mx-auto flex flex-col-reverse md:flex-row-reverse items-start mt-4">
                
                {/* Filter Sidebar - Right Side */}
                <Sidebar 
                    showFilters={true} 
                    onFiltersChange={handleFiltersChange}
                    categories={categories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    initialCategory={categoryName}
                />

                <div className="flex-1 w-full min-w-0 pb-16 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">


                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" style={{ fontFamily: "'Boston Angel', serif" }}>
                                    {filters.categories && filters.categories.length > 0 
                                        ? filters.categories.join(', ') 
                                        : categoryName}
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 mt-1">
                                    {loading ? 'Loading...' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 md:py-24">
                            <div className="text-6xl md:text-8xl mb-4">👗</div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
                            <p className="text-gray-600 text-center max-w-md mb-6">
                                We couldn't find any products in this category. Try adjusting your filters or check back later.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Browse All Products
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        inCart={isInCart(product._id)}
                                        inWishlist={isInWishlist(product._id)}
                                        addingToCart={addingToCart}
                                        addingToWishlist={addingToWishlist}
                                        onProductClick={handleProductClick}
                                        onAddToCart={addToCart}
                                        onAddToWishlist={addToWishlist}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-2">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const page = index + 1;
                                            // Show first page, last page, current page, and pages around current
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-4 py-2 rounded-lg ${currentPage === page
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return <span key={page} className="px-2">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CategoriesSpecificpage;
