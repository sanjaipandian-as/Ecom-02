import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { MdStorefront, MdSearch, MdStar } from 'react-icons/md';
import API from '../../../../api';
import PlaceholderImage from '../../../assets/Placeholder.png';

const ToggleSwitch = ({ enabled, onToggle, disabled }) => (
    <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-all duration-300 ${enabled
            ? 'border-emerald-500 bg-emerald-500/90'
            : 'border-slate-300 bg-slate-200'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
        <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-9' : 'translate-x-1'}`}
        />
    </button>
);

const AdminTopSellingProducts = ({ refreshId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [savingProductId, setSavingProductId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [refreshId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching top selling products admin list:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return products;

        return products.filter((product) =>
            product.name?.toLowerCase().includes(term) ||
            product.brand?.toLowerCase().includes(term) ||
            product.category?.main?.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    const selectedCount = useMemo(
        () => products.filter((product) => product.showInTopSelling).length,
        [products]
    );

    const handleToggle = async (productId, nextValue) => {
        const previousProducts = products;
        setSavingProductId(productId);
        setProducts((current) =>
            current.map((product) =>
                product._id === productId ? { ...product, showInTopSelling: nextValue } : product
            )
        );

        try {
            await API.patch(`/admin/products/${productId}/top-selling`, {
                showInTopSelling: nextValue,
            });
            toast.success(nextValue ? 'Product added to homepage top selling' : 'Product removed from homepage top selling');
        } catch (error) {
            console.error('Error updating top selling product:', error);
            setProducts(previousProducts);
            toast.error('Failed to update homepage visibility');
        } finally {
            setSavingProductId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8 xl:px-12">
            <div className="mb-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-slate-500">Homepage Control</p>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Top Selling Products</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                            Toggle products on or off for the homepage top selling section. The recommendation section is automatic and uses customer buying history.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Selected</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{selectedCount}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Total Products</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{products.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-xl">
                    <MdSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search products, brand, or category"
                        className="w-full rounded-[18px] border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-sm"
                    />
                </div>
                <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Recommendation section stays empty until a customer has orders
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-36 rounded-[28px] border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <MdStorefront className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No products found</h2>
                    <p className="mt-2 text-sm text-slate-500">Try a different search and the full product list will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredProducts.map((product) => {
                        const image = product.images?.find((img) => img && img.trim() !== '') || PlaceholderImage;
                        const isEnabled = Boolean(product.showInTopSelling);
                        const sellingPrice = product.pricing?.selling_price || 0;

                        return (
                            <div key={product._id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="h-28 w-28 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                                        <img
                                            src={image}
                                            alt={product.name}
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = PlaceholderImage;
                                            }}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                                                {product.category?.main || 'Category'}
                                            </span>
                                            {isEnabled && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                                                    <MdStar />
                                                    Live on homepage
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="truncate text-xl font-bold tracking-tight text-slate-900">{product.name}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{product.brand || 'Brand not set'}</p>

                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                                            <span>Rs. {sellingPrice.toFixed(0)}</span>
                                            <span>Stock: {product.stock || 0}</span>
                                            <span>Sold: {product.sold_count || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex min-w-[180px] flex-col items-start gap-3 sm:items-end">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                                            {isEnabled ? 'Toggle On' : 'Toggle Off'}
                                        </p>
                                        <ToggleSwitch
                                            enabled={isEnabled}
                                            disabled={savingProductId === product._id}
                                            onToggle={() => handleToggle(product._id, !isEnabled)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminTopSellingProducts;
