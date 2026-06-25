import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, ShoppingBag } from 'lucide-react';
import API from '../../../../api';
// import API from '../../../'
import placeholderImg from '../../../assets/Placeholder.png';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const image = product.images?.find((img) => img && img.trim() !== '') || placeholderImg;
    const sellingPrice = product.pricing?.selling_price || 0;
    const mrp = product.pricing?.mrp || sellingPrice;
    const discount = product.pricing?.discount_percentage > 0 
        ? product.pricing.discount_percentage 
        : (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
    
    const rating = product.averageRating || (4.5 + Math.random() * 0.5).toFixed(1);
    const reviews = product.totalReviews || Math.floor(Math.random() * 500) + 50;
    const isViral = product.showInViral;

    return (
        <div 
            className="group relative flex flex-col h-full animate-fade-in bg-white rounded-3xl p-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-transparent hover:border-gray-100"
        >
            {/* Image Container */}
            <div 
                onClick={() => navigate(`/product/${product._id}`)}
                className="relative aspect-[1/1.1] rounded-2xl overflow-hidden bg-gray-50 mb-4 cursor-pointer"
            >
                {/* Status Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {isViral && (
                        <div className="bg-amber-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            Viral 🔥
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            {discount}% OFF
                        </div>
                    )}
                </div>

                {/* Wishlist Button (Decorative for now) */}
                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all shadow-sm">
                    <Star className="w-4 h-4" />
                </button>

                <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic here
                        }}
                        className="w-full py-3 bg-white text-black text-[12px] font-black uppercase tracking-wider rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-black hover:text-white"
                    >
                        Add to Bag
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 px-1">
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{reviews} reviews</span>
                </div>
                
                <h3 
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="text-[17px] font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] leading-snug cursor-pointer hover:text-amber-600 transition-colors"
                >
                    {product.name}
                </h3>
                
                <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {product.description || 'Premium quality care for your unique beauty needs.'}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[20px] font-black text-gray-900 font-outfit">₹{sellingPrice}</span>
                        {mrp > sellingPrice && (
                            <span className="text-sm text-gray-350 font-medium line-through font-outfit">₹{mrp}</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const BestSellers = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All', 'Face Care', 'Hair Care', 'Body Care', 'Lip Care']);
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);
                const response = await API.get('/products/customer/homepage-sections');
                setProducts(response.data?.topSellingProducts || []);
            } catch (error) {
                console.error('Error fetching best sellers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBestSellers();
    }, []);

    const filteredProducts = products.filter(p => {
        if (activeTab === 'All') return true;
        const cat = (p.category?.main || '').toLowerCase().trim();
        const tab = activeTab.toLowerCase().trim();
        
        if (tab === 'face care') {
            return cat.includes('face') || 
                   cat.includes('serum') || 
                   cat.includes('sunscreen') || 
                   cat.includes('moisture') || 
                   cat.includes('eye');
        }
        if (tab === 'hair care') {
            return cat.includes('hair') || 
                   cat.includes('shampoo') || 
                   cat.includes('conditioner');
        }
        if (tab === 'body care') {
            return cat.includes('body') || 
                   cat.includes('soap') || 
                   cat.includes('scrub') || 
                   cat.includes('lotion');
        }
        if (tab === 'lip care') {
            return cat.includes('lip');
        }
        return cat === tab;
    });

    return (
        <section className="w-full pt-4 pb-2 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                    <div className="space-y-4 text-center md:text-left">
                        {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Top Trending</span>
                        </div> */}
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Best Sellers</h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-md font-medium">
                            Explore our community favorites and award-winning essentials that everyone is talking about.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6">
                        {/* Category Tabs */}
                        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                            {categories.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                                        activeTab === tab 
                                        ? 'bg-black text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-black'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => navigate('/category/bestsellers')}
                            className="hidden md:flex items-center gap-2 text-sm font-black uppercase tracking-wider text-gray-900 hover:text-amber-600 transition-colors group"
                        >
                            Explore All Products
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-4 h-[450px] shadow-sm animate-pulse">
                                <div className="aspect-[1/1.1] bg-gray-100 rounded-2xl mb-6"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                                <div className="h-6 bg-gray-100 rounded w-3/4 mb-3"></div>
                                <div className="h-12 bg-gray-100 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {filteredProducts.slice(0, 5).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-inner">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Best Sellers Found</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">We're updating our collection. Check back soon for our most popular items.</p>
                    </div>
                )}

                {/* Mobile View All */}
                <div className="mt-12 md:hidden">
                    <button 
                        onClick={() => navigate('/category/bestsellers')}
                        className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
                    >
                        View All Best Sellers
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BestSellers;
