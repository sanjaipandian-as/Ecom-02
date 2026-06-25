import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaShoppingBag } from 'react-icons/fa';
import API from '../../../api';
import placeholderImg from '../../assets/Placeholder.png';

const SectionCard = ({ product, accent = 'from-amber-100 via-white to-rose-100' }) => {
    const navigate = useNavigate();
    const image = product.images?.find((img) => img && img.trim() !== '') || placeholderImg;
    const sellingPrice = product.pricing?.selling_price || 0;
    const mrp = product.pricing?.mrp || sellingPrice;
    const discount = product.pricing?.discount_percentage > 0 
        ? product.pricing.discount_percentage 
        : (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);

    return (
        <button
            type="button"
            onClick={() => navigate(`/product/${product._id}`)}
            className="group text-left bg-white rounded-[16px] border border-gold-champagne/15 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-350 hover:-translate-y-1 flex flex-col h-full"
        >
            <div className="relative aspect-square bg-cream-base overflow-hidden border-b border-gold-champagne/10 flex-shrink-0">
                {discount > 0 && (
                    <div className="absolute top-4 left-4 z-10 rounded-xs bg-luxury-crimson px-2.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-sm uppercase">
                        {discount}% OFF
                    </div>
                )}
                <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImg;
                    }}
                />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-gold-lustrous">
                        {product.category?.main || 'Collection'}
                    </p>
                    <h3 className="mb-3 line-clamp-2 text-[17px] font-medium leading-relaxed text-stone-850 font-serif">
                        {product.name}
                    </h3>
                </div>
                <div className="flex items-end justify-between gap-3 mt-3">
                    <div>
                        {mrp > sellingPrice && (
                            <p className="text-[13px] text-stone-400 font-medium line-through font-outfit">₹{mrp.toFixed(0)}</p>
                        )}
                        <p className="text-[20px] font-bold tracking-tight text-stone-900 font-outfit">₹{sellingPrice.toFixed(0)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-gold-lustrous">
                        View
                        <FaArrowRight className="w-3 h-3 transition-transform duration-350 group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </button>
    );
};

const EmptyState = ({ title, description }) => (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50/70 px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-stone-500 shadow-sm">
            <FaShoppingBag />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-900">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-stone-500">{description}</p>
    </div>
);

const HomepageProductSections = ({ hideTopSelling = false }) => {
    const isCustomerLoggedIn = useMemo(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
        return Boolean(token) && role === 'customer';
    }, []);

    const [sections, setSections] = useState({
        topSellingProducts: [],
        viralProducts: [],
        recommendedProducts: [],
    });
    const [loading, setLoading] = useState(true);
    const [hasOrders, setHasOrders] = useState(false);

    useEffect(() => {
        const loadSections = async () => {
            try {
                setLoading(true);
                const response = await API.get('/products/customer/homepage-sections');
                setSections({
                    topSellingProducts: response.data?.topSellingProducts || [],
                    viralProducts: response.data?.viralProducts || [],
                    recommendedProducts: response.data?.recommendedProducts || [],
                });

                if (isCustomerLoggedIn) {
                    try {
                        const ordersRes = await API.get('/orders');
                        const ordersList = ordersRes.data?.orders || [];
                        setHasOrders(ordersList.length > 0);
                    } catch (error) {
                        console.error('Failed to load user orders:', error);
                        setHasOrders(false);
                    }
                } else {
                    setHasOrders(false);
                }
            } catch (error) {
                console.error('Failed to load homepage sections:', error);
                setSections({
                    topSellingProducts: [],
                    viralProducts: [],
                    recommendedProducts: [],
                });
            } finally {
                setLoading(false);
            }
        };

        loadSections();
    }, [isCustomerLoggedIn]);

    const renderSection = (title, subtitle, products, accent, emptyTitle, emptyDescription) => (
        <section className="mb-12 sm:mb-16">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-gold-champagne/10 pb-4">
                <div>
                    {subtitle && <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-gold-lustrous">{subtitle}</p>}
                    <h2 className="text-2xl font-bold tracking-tight text-emerald-deep sm:text-3xl font-serif">{title}</h2>
                </div>
                <div className="hidden rounded-full border border-gold-champagne/20 bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-gold-lustrous sm:block">
                    {products.length} items
                </div>
            </div>

            {products.length === 0 ? (
                <EmptyState title={emptyTitle} description={emptyDescription} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {products.map((product) => (
                        <SectionCard key={product._id} product={product} accent={accent} />
                    ))}
                </div>
            )}
        </section>
    );

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-[380px] rounded-[16px] border border-gold-champagne/15 bg-cream-base animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
            {!hideTopSelling && renderSection(
                'Top Selling Products',
                null,
                sections.topSellingProducts,
                null,
                'No top selling products selected yet',
                'Turn on products from the admin homepage section and they will appear here immediately.'
            )}

            {renderSection(
                'Viral Products',
                null,
                sections.viralProducts,
                null,
                'No viral products selected yet',
                'Turn on products from the admin homepage section and they will appear here immediately.'
            )}

            {isCustomerLoggedIn && hasOrders && renderSection(
                'Recommended For You',
                'Based On Buying History',
                sections.recommendedProducts,
                null,
                'No recommendation data yet',
                'When this account has completed orders, this section will automatically show matching products.'
            )}
        </div>
    );
};

export default HomepageProductSections;
