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
    const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

    return (
        <button
            type="button"
            onClick={() => navigate(`/product/${product._id}`)}
            className="group text-left bg-white rounded-[28px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            <div className={`relative aspect-[4/4.6] bg-gradient-to-br ${accent} p-5 overflow-hidden`}>
                {discount > 0 && (
                    <div className="absolute top-4 left-4 rounded-full bg-[#1f3b2d] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                        {discount}% OFF
                    </div>
                )}
                <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImg;
                    }}
                />
            </div>

            <div className="p-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                    {product.category?.main || 'Collection'}
                </p>
                <h3 className="mb-3 line-clamp-2 text-[16px] font-semibold leading-snug text-stone-900">
                    {product.name}
                </h3>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        {mrp > sellingPrice && (
                            <p className="text-xs text-stone-400 line-through">Rs. {mrp.toFixed(0)}</p>
                        )}
                        <p className="text-xl font-bold tracking-tight text-stone-950">Rs. {sellingPrice.toFixed(0)}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f3b2d]">
                        View
                        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
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

const HomepageProductSections = () => {
    const [sections, setSections] = useState({
        topSellingProducts: [],
        recommendedProducts: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSections = async () => {
            try {
                setLoading(true);
                const response = await API.get('/products/customer/homepage-sections');
                setSections({
                    topSellingProducts: response.data?.topSellingProducts || [],
                    recommendedProducts: response.data?.recommendedProducts || [],
                });
            } catch (error) {
                console.error('Failed to load homepage sections:', error);
                setSections({
                    topSellingProducts: [],
                    recommendedProducts: [],
                });
            } finally {
                setLoading(false);
            }
        };

        loadSections();
    }, []);

    const isCustomerLoggedIn = useMemo(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
        return Boolean(token) && role === 'customer';
    }, []);

    const renderSection = (title, subtitle, products, accent, emptyTitle, emptyDescription) => (
        <section className="mb-8 sm:mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">{subtitle}</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{title}</h2>
                </div>
                <div className="hidden rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:block">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-[360px] rounded-[28px] border border-stone-200 bg-stone-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
            {renderSection(
                'Top Selling Products',
                'Curated By Admin',
                sections.topSellingProducts,
                'from-amber-100 via-orange-50 to-white',
                'No top selling products selected yet',
                'Turn on products from the admin homepage section and they will appear here immediately.'
            )}

            {renderSection(
                'Recommended For You',
                'Based On Buying History',
                sections.recommendedProducts,
                'from-emerald-100 via-teal-50 to-white',
                isCustomerLoggedIn ? 'No recommendation data yet' : 'Login to get personalized picks',
                isCustomerLoggedIn
                    ? 'When this account has completed orders, this section will automatically show matching products.'
                    : 'This section uses customer buying history, so it stays empty until a customer signs in and has order history.'
            )}
        </div>
    );
};

export default HomepageProductSections;
