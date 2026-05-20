import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaTimes, FaCheckCircle, FaStar } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';
import Topbar from './Topbar';
import Footer from './Footer';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingItem, setRemovingItem] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetchWishlist();
        fetchCart();
    }, []);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/Login');
                return;
            }

            setLoading(true);
            const response = await API.get('/wishlist');
            setWishlistItems(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            console.error('Fetch wishlist error:', err);
            if (err.response?.status === 401) {
                navigate('/Login');
            } else {
                setError('Failed to load wishlist');
            }
        } finally {
            setLoading(false);
        }
    };

    // Memoize valid wishlist items to avoid recalculating on every render
    const validWishlistItems = useMemo(() => {
        return wishlistItems.filter(item => item && item.productId && item.productId._id);
    }, [wishlistItems]);

    const removeFromWishlist = useCallback(async (productId) => {
        setRemovingItem(productId);
        try {
            await API.delete(`/wishlist/remove/${productId}`);
            setWishlistItems(prevItems => prevItems.filter(item => item && item.productId && item.productId._id !== productId));
        } catch (err) {
            console.error('Remove from wishlist error:', err);
            setError(err.response?.data?.message || 'Failed to remove from wishlist');
        } finally {
            setRemovingItem(null);
        }
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    const addToCart = useCallback(async (product) => {
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
            setError('');
            fetchCart(); // Refresh cart items
        } catch (err) {
            console.error('Add to cart error:', err);
            setError(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(null);
        }
    }, [cartItems, navigate]);

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 w-full animate-pulse">
                <div className="h-10 bg-slate-200 w-1/4 mb-10 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-4">
                            <Skeleton className="w-full aspect-[4/3] mb-4" />
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-6 w-12" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-3 w-12 ml-auto" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                    <Skeleton className="h-7 w-20" />
                                    <Skeleton className="h-10 w-32 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (validWishlistItems.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-24 h-24 bg-rose-50/60 border border-rose-100 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                    <BsFillBagHeartFill className="text-rose-500 text-4xl animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight uppercase">Your Wishlist is Empty</h2>
                <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed text-sm">
                    Add items you like to your wishlist so you can find them easily later and keep track of special deals.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-10 py-4 bg-[#45C3D3] hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-teal-500/10 hover:shadow-lg active:scale-95"
                >
                    Browse Collections
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 lg:py-16 w-full">
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-slate-200/80 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">
                        My <span className="text-rose-500 font-medium">Wishlist</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        You have {validWishlistItems.length} {validWishlistItems.length === 1 ? 'item' : 'items'} saved in your collection
                    </p>
                </div>
                <button
                    onClick={() => navigate('/Cart')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#45C3D3] hover:bg-teal-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-teal-500/10 hover:shadow-lg active:scale-95"
                >
                    <FaShoppingCart className="text-sm" />
                    <span>View Cart</span>
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                    <FaTimes className="w-4 h-4 flex-shrink-0" />
                    <p className="font-semibold text-xs uppercase tracking-wider">{error}</p>
                </div>
            )}

            {/* --- GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {validWishlistItems.map((item) => {
                    const isInCart = cartItems.some(cartItem =>
                        (cartItem.productId?._id || cartItem.productId) === item.productId._id
                    );
                    const isOutOfStock = (item.productId.stock || 0) <= 0;
                    const isAdding = addingToCart === item.productId._id;

                    return (
                        <div
                            key={item.productId._id}
                            className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Image Container with premium gradient background */}
                            <div 
                                onClick={() => navigate(`/product/${item.productId._id}`)}
                                className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-slate-50/60 to-slate-100/30 flex items-center justify-center p-6 cursor-pointer"
                            >
                                <img
                                    src={item.productId.images?.[0] || placeholderImg}
                                    alt={item.productId.name}
                                    className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.src = placeholderImg;
                                        e.target.onerror = null;
                                    }}
                                />

                                {/* Remove Button - Delicate Floating Circle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWishlist(item.productId._id);
                                    }}
                                    disabled={removingItem === item.productId._id}
                                    className="absolute top-3.5 right-3.5 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm hover:scale-105 active:scale-95 transition-all z-10 disabled:opacity-50"
                                >
                                    {removingItem === item.productId._id ? (
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></div>
                                    ) : (
                                        <FaTrash className="w-3.5 h-3.5 text-rose-500" />
                                    )}
                                </button>

                                {/* Out of Stock sophisticated overlay */}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <span className="bg-white/95 text-slate-900 font-bold text-[10px] tracking-widest uppercase px-4 py-2 rounded-full shadow-md border border-slate-100">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Details section */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="flex flex-col gap-1 mb-2.5">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {item.productId.category?.main || (typeof item.productId.category === 'string' ? item.productId.category : 'General')}
                                    </span>
                                    <h3 
                                        onClick={() => navigate(`/product/${item.productId._id}`)}
                                        className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-slate-950 transition-colors cursor-pointer capitalize"
                                    >
                                        {item.productId.name.toLowerCase()}
                                    </h3>
                                </div>

                                {/* Ratings and stock status */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                        <FaStar className="w-2.5 h-2.5 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-600">4.2</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#45C3D3] uppercase tracking-wider">
                                        {item.productId.brand || 'Official'}
                                    </span>
                                </div>

                                {/* Pricing and Cart block */}
                                <div className="flex items-center justify-between pt-3.5 border-t border-slate-50 mt-auto">
                                    <div className="flex flex-col">
                                        {(item.productId.pricing?.mrp || item.productId.originalPrice) && (
                                            <span className="text-[11px] text-slate-400 font-medium line-through">
                                                ₹{(item.productId.pricing?.mrp || item.productId.originalPrice || 0).toFixed(0)}
                                            </span>
                                        )}
                                        <span className="text-lg font-bold text-slate-900 tracking-tight font-outfit">
                                            ₹{(item.productId.pricing?.selling_price || item.productId.price || 0).toFixed(0)}
                                        </span>
                                    </div>

                                    {isInCart ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/cart');
                                            }}
                                            className="h-9 px-4 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-xs hover:bg-emerald-100/70 hover:border-emerald-300 transition-all shadow-sm"
                                        >
                                            <FaCheckCircle className="w-3.5 h-3.5" />
                                            Cart
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item.productId)}
                                            disabled={isAdding || isOutOfStock}
                                            className={`h-9 px-4 flex items-center gap-1.5 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 ${
                                                isOutOfStock
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100 shadow-none'
                                                    : 'bg-[#45C3D3] hover:bg-teal-500 shadow-teal-500/10 hover:shadow-lg'
                                            }`}
                                        >
                                            {isAdding ? (
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    <FaShoppingCart className="w-3 h-3" />
                                                    <span>Add</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Wishlist;