import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    MdSearch,
    MdRefresh,
    MdInventory,
    MdEdit,
    MdDelete,
    MdAdd,
    MdGridView,
    MdList,
    MdLayers,
    MdShowChart,
    MdShoppingBag,
    MdAccountBalanceWallet,
    MdViewHeadline,
    MdAutoAwesomeMosaic,
    MdAssessment,
    MdArrowBack,
    MdTrendingUp,
    MdTrendingDown,
    MdLocalOffer,
    MdBlock,
    MdCheckCircle,
    MdSell,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdClose
} from 'react-icons/md';
import { FaRupeeSign } from 'react-icons/fa';
import API from '../../../../api';
import ProductUploadModal from './ProductUploadModal';
import PlaceholderImage from '../../../assets/Placeholder.png';

// --- Sub-Component: Margin Visualizer ---
const MarginChart = ({ percentage }) => {
    const radius = 60;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#F1F5F9"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={percentage > 25 ? "#10B981" : percentage > 10 ? "#F59E0B" : "#EF4444"}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="square"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 leading-none">{Math.round(percentage)}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Margin</span>
            </div>
        </div>
    );
};

// --- Helper: Check if file path is a video ---
const isVideo = (path) => {
    if (!path || typeof path !== 'string') return false;
    if (path.includes('#video')) return true;
    if (path.startsWith('data:video/')) return true;
    const cleanPath = path.split('?')[0].split('#')[0].toLowerCase();
    const ext = cleanPath.split('.').pop();
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', '3gp', '3gpp', '3gpp2', 'mpeg', 'flv', 'wmv'].includes(ext);
};

// --- Sub-Component: Product Grid Card ---
const ProductGridCard = ({ product, onEdit, onDelete, isSelectionMode, isSelected, onToggleSelection }) => {
    const [showMarginView, setShowMarginView] = useState(false);

    const sellingPrice = product.pricing?.selling_price || 0;
    const mrp = product.pricing?.mrp || sellingPrice;
    const costPrice = product.pricing?.cost || 0;
    const soldCount = product.sold_count || 0;

    const unitProfit = sellingPrice - costPrice;
    const marginPercentage = sellingPrice > 0 ? (unitProfit / sellingPrice) * 100 : 0;
    const totalProfit = unitProfit * soldCount;
    const totalRevenue = sellingPrice * soldCount;

    const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

    if (showMarginView) {
        return (
            <div className="group relative bg-white rounded-none border border-slate-200 p-6 shadow-sm transition-all duration-300 animate-fadeIn min-h-[520px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => setShowMarginView(false)}
                        className="w-10 h-10 bg-slate-50 text-slate-900 rounded-none flex items-center justify-center border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                        <MdArrowBack size={20} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profit Intelligence</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center mb-8">
                    <MarginChart percentage={marginPercentage} />

                    <div className="mt-8 text-center">
                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1 line-clamp-1 truncate max-w-[200px]">{product.name}</h4>
                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Margin Analysis Hub</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Profit</p>
                            <p className="font-bold text-emerald-650">₹{unitProfit.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-none border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm">
                            <MdTrendingUp size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-none border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cost</p>
                            <p className="font-bold text-slate-900 text-sm">₹{costPrice.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-none border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gross</p>
                            <p className="font-bold text-indigo-600 text-sm">₹{totalProfit.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowMarginView(false)}
                    className="mt-8 w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-none hover:bg-[#4F46E5] transition-all shadow-md active:scale-[0.98]"
                >
                    Close Analysis
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={() => isSelectionMode && onToggleSelection(product._id)}
            className={`group relative bg-white rounded-none border ${isSelected ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/10 shadow-md' : 'border-slate-200'} p-5 hover:border-slate-450 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col min-h-[520px] ${isSelectionMode ? 'cursor-pointer' : ''}`}
        >
            {isSelectionMode && (
                <div className="absolute top-6 left-6 z-40 bg-white rounded-none shadow-md border border-slate-200 p-1">
                    {isSelected ? (
                        <MdCheckBox className="text-2xl text-[#4F46E5]" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="text-2xl text-slate-350" />
                    )}
                </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-none -mr-16 -mt-16 group-hover:bg-[#4F46E5]/5 transition-colors duration-500" />

            <div className="relative aspect-[1/1] rounded-none overflow-hidden bg-slate-50 mb-6 border border-slate-200 shadow-inner">
                {isVideo(product.images?.[0]) ? (
                    <video
                        src={product.images[0]}
                        className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        muted
                        loop
                        playsInline
                        autoPlay
                    />
                ) : (
                    <img
                        src={(product.images?.filter(img => img && img.trim() !== '')?.[0]) || PlaceholderImage}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src = PlaceholderImage; }}
                    />
                )}

                {discountPercent > 0 && (
                    <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-35">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="bg-[#EF4444] text-white font-bold text-[9px] uppercase tracking-[0.2em] py-1.5 w-[160%] absolute top-5 -right-[30%] rotate-45 text-center border-y border-white/20 select-none">
                                {discountPercent}% OFF
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-4 z-10">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-none text-[10px] font-bold uppercase tracking-[0.1em] text-slate-800 shadow-sm border border-slate-200 flex items-center gap-2">
                        <MdLayers className="text-[#4F46E5] text-sm" />
                        {product.category?.main || 'Uncategorized'}{product.category?.sub ? ` - ${product.category.sub}` : ''}
                    </span>
                </div>

                <div className={`absolute inset-0 bg-slate-900/60 opacity-0 ${!isSelectionMode ? 'group-hover:opacity-100' : ''} transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                        className="w-14 h-14 bg-white text-slate-900 rounded-none flex items-center justify-center hover:bg-[#4F46E5] hover:text-white transition-all shadow-md active:scale-90"
                    >
                        <MdEdit size={22} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                        className="w-14 h-14 bg-white text-[#EF4444] rounded-none flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-all shadow-md active:scale-90"
                    >
                        <MdDelete size={22} />
                    </button>
                </div>
            </div>

            <div className="px-2 flex-1 flex flex-col">
                <div className="mb-4">
                    <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-1 font-hero tracking-tight group-hover:text-[#4F46E5] transition-colors">
                            {product.name}
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMarginView(true); }}
                            className="bg-slate-50 text-slate-400 p-2 rounded-none border border-slate-200 hover:bg-[#4F46E5] hover:text-white transition-all shadow-sm flex items-center justify-center"
                            title="Margin Analysis"
                        >
                            <MdAssessment size={18} />
                        </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{product.brand || 'Nexus Premium'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-none border border-slate-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4F46E5]">
                            <MdInventory size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock</p>
                            <p className={`text-sm font-bold ${product.stock <= 5 ? 'text-red-650' : 'text-slate-900'}`}>{product.stock}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-none border border-slate-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-500">
                            <MdShowChart size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sold</p>
                            <p className="text-sm font-bold text-slate-900">{product.sold_count || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MdShoppingBag className="text-slate-350" /> Valuation Hub
                        </p>
                        {discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest px-2 py-0.5 bg-red-50 border border-red-100 rounded-none">Sales Event</span>
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            {discountPercent > 0 && (
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-bold text-slate-400 line-through decoration-slate-300">
                                        ₹{mrp.toLocaleString('en-IN')}
                                    </p>
                                    <span className="bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none uppercase tracking-tighter">
                                        -{discountPercent}%
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <p className={`text-2xl font-bold flex items-baseline gap-0.5 ${discountPercent > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                    <span className="text-sm font-bold pr-1">₹</span>
                                    {sellingPrice.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-end">
                                <MdAccountBalanceWallet className="text-slate-355" /> Revenue
                            </p>
                            <p className="text-lg font-bold text-emerald-600">
                                <span className="text-[10px] font-bold text-emerald-450 pr-1">₹</span>
                                {totalRevenue.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminAllProducts = ({ refreshId }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    // Selection Mode Logic
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0
    });

    useEffect(() => {
        fetchAllProducts();
    }, [refreshId]);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, statusTab]);

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/products');
            setProducts(response.data || []);
            calculateStats(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
            toast.error('Failed to load products');
        }
    };

    const calculateStats = (productData) => {
        const activeProducts = productData.filter(p => !p.is_deleted);
        setStats({
            total: activeProducts.length,
            published: activeProducts.filter(p => p.stock > 0).length,
            drafts: activeProducts.filter(p => p.stock === 0).length
        });
    };

    const filterProducts = () => {
        let filtered = products.filter(p => !p.is_deleted);
        if (statusTab === 'published') {
            filtered = filtered.filter(p => p.stock > 0);
        } else if (statusTab === 'draft') {
            filtered = filtered.filter(p => p.stock === 0);
        }
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.category?.main || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    };

    const handleAddProduct = () => {
        setProductToEdit(null);
        setShowUploadModal(true);
    };

    const handleEdit = (product) => {
        setProductToEdit(product);
        setShowUploadModal(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await API.delete(`/admin/products/${productToDelete._id}`);
            toast.success('Product deleted successfully');
            fetchAllProducts();
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleUploadSuccess = () => {
        fetchAllProducts();
        setShowUploadModal(false);
        setProductToEdit(null);
    };

    const toggleProductSelection = (id) => {
        setSelectedProductIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkDeactivate = async () => {
        if (selectedProductIds.length === 0) {
            toast.warning('No assets selected for deactivation protocol');
            return;
        }

        try {
            setLoading(true);
            await Promise.all(selectedProductIds.map(id => API.delete(`/admin/products/${id}`)));

            toast.success(`Successful Deactivation: ${selectedProductIds.length} assets purged from active catalog`);
            setSelectedProductIds([]);
            setIsSelectionMode(false);
            fetchAllProducts();
        } catch (error) {
            console.error('Bulk deactivation error:', error);
            toast.error('Global Deactivation Pulse Failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-body p-4 md:p-12 pb-32">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8 animate-in fade-in slide-in-from-top-3 duration-700">
                <div className="relative group w-full lg:max-w-xl">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4F46E5] transition-all text-2xl" />
                    <input
                        type="text"
                        placeholder="Search directory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-4 bg-white border border-slate-200 rounded-none text-slate-755 font-semibold placeholder:text-slate-350 outline-none shadow-sm focus:border-[#4F46E5] focus:shadow-md transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    {isSelectionMode ? (
                        <>
                            <button
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-slate-800 transition-all shadow-sm"
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedProductIds([]);
                                }}
                            >
                                <MdClose size={18} />
                                Cancel Selection
                            </button>
                            <button
                                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 ${selectedProductIds.length > 0 ? 'bg-[#EF4444]' : 'bg-slate-200 text-slate-400'} text-white font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-red-700 transition-all shadow-sm`}
                                onClick={handleBulkDeactivate}
                                disabled={selectedProductIds.length === 0}
                            >
                                <MdBlock size={18} />
                                Finalize Deactivation ({selectedProductIds.length})
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-red-50 hover:text-[#EF4444] hover:border-red-200 transition-all shadow-sm"
                                onClick={() => {
                                    setIsSelectionMode(true);
                                    toast.info('Selection Protocol Active: Tap assets to queue for deactivation');
                                }}
                            >
                                <MdBlock size={18} />
                                Deactivate
                            </button>
                            <button
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#4F46E5] text-white font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-[#4338CA] transition-all shadow-sm"
                                onClick={() => toast.info('Sales Protocol: Opening bulk discount engine')}
                            >
                                <MdLocalOffer size={18} />
                                Apply Discount
                            </button>
                        </>
                    )}
                    <div className="w-px h-10 bg-slate-200 hidden lg:block mx-2" />
                    <button
                        onClick={fetchAllProducts}
                        className="w-12 h-12 bg-white border border-slate-200 text-slate-450 rounded-none flex items-center justify-center hover:text-[#4F46E5] hover:border-[#4F46E5] transition-all shadow-sm"
                    >
                        <MdRefresh size={22} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-slideUp">
                <div>
                    <h1 className="text-5xl font-bold text-slate-900 tracking-tighter font-hero mb-3">Asset Catalog</h1>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white font-bold rounded-none transition-all hover:bg-[#4F46E5] active:scale-[0.98] overflow-hidden shadow-sm"
                >
                    <MdAdd className="text-2xl" />
                    <span className="uppercase tracking-widest text-xs">Register Asset</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <div className="flex bg-white border border-slate-200 p-1 rounded-none gap-1 w-full md:w-auto shadow-sm">
                    {[
                        { id: 'all', label: 'Global' },
                        { id: 'published', label: 'Active' },
                        { id: 'draft', label: 'Reserved' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusTab(tab.id)}
                            className={`px-10 py-3.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${statusTab === tab.id
                                ? 'bg-[#4F46E5] text-white'
                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex bg-slate-50 p-1 rounded-none border border-slate-200 gap-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-none transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <MdGridView size={22} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-none transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <MdList size={22} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-white border border-slate-200 rounded-none animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-none border border-slate-200 shadow-sm">
                    <div className="w-24 h-24 bg-slate-55 rounded-none border border-slate-200 flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <MdInventory size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2 font-hero tracking-tight">System Buffer Cleared</h3>
                    <p className="text-slate-450 font-semibold text-xs uppercase tracking-[0.2em]">Ready for new asset registration protocols.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <section className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                        {filteredProducts.map(product => (
                            <ProductGridCard
                                key={product._id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedProductIds.includes(product._id)}
                                onToggleSelection={toggleProductSelection}
                            />
                        ))}
                    </div>
                </section>
            ) : (
                <section className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-slate-200">
                                <tr>
                                    {isSelectionMode && (
                                        <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select</th>
                                    )}
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Identification</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing Model</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredProducts.map((product) => {
                                    const isSelected = selectedProductIds.includes(product._id);
                                    const sPrice = product.pricing?.selling_price || 0;
                                    const mrpPrice = product.pricing?.mrp || sPrice;
                                    const discount = mrpPrice > sPrice ? Math.round(((mrpPrice - sPrice) / mrpPrice) * 100) : 0;

                                    return (
                                        <tr
                                            key={product._id}
                                            className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => isSelectionMode ? toggleProductSelection(product._id) : handleEdit(product)}
                                        >
                                            {isSelectionMode && (
                                                <td className="px-6 py-6">
                                                    {isSelected ? (
                                                        <MdCheckBox className="text-xl text-[#4F46E5]" />
                                                    ) : (
                                                        <MdCheckBoxOutlineBlank className="text-xl text-slate-300" />
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-none overflow-hidden border border-slate-200 shadow-sm relative">
                                                        {isVideo(product.images?.[0]) ? (
                                                            <video
                                                                src={product.images[0]}
                                                                className="w-full h-full object-cover"
                                                                muted
                                                                loop
                                                                playsInline
                                                                autoPlay
                                                            />
                                                        ) : (
                                                            <img src={product.images?.[0] || PlaceholderImage} className="w-full h-full object-cover" />
                                                        )}
                                                        {discount > 0 && (
                                                            <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                                                                <span className="text-[8px] font-bold text-[#EF4444] uppercase">-{discount}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg tracking-tight truncate max-w-[200px]">{product.name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{product.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="bg-white px-4 py-2 rounded-none text-[10px] font-bold text-[#4F46E5] uppercase border border-slate-200 shadow-sm tracking-widest">{product.category?.main || 'Uncategorized'}{product.category?.sub ? ` - ${product.category.sub}` : ''}</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    {discount > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-semibold text-slate-400 line-through decoration-slate-300">₹{mrpPrice.toLocaleString('en-IN')}</span>
                                                            <span className="bg-red-50 border border-red-100 text-[#EF4444] text-[8px] font-bold px-1 rounded-none uppercase">-{discount}%</span>
                                                        </div>
                                                    )}
                                                    <span className={`font-bold text-lg ${discount > 0 ? 'text-[#EF4444]' : 'text-slate-900'}`}>₹{sPrice.toLocaleString('en-IN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-sm font-bold ${product.stock < 10 ? 'text-[#EF4444]' : 'text-slate-900'}`}>{product.stock} Units</span>
                                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Reserved in pool</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <ProductUploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setProductToEdit(null);
                }}
                onSuccess={handleUploadSuccess}
                productToEdit={productToEdit}
            />

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-none p-10 max-w-sm w-full shadow-lg border border-slate-200 animate-scaleIn">
                        <div className="w-24 h-24 bg-red-50 rounded-none border border-red-100 flex items-center justify-center mx-auto mb-10 shadow-sm group">
                            <MdDelete className="text-5xl text-[#EF4444] group-hover:rotate-6 transition-transform" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 text-center mb-4 tracking-tight">System Purge</h3>
                        <p className="text-sm text-slate-450 text-center mb-12 font-semibold uppercase tracking-widest leading-loose">
                            Confirm permanent elimination of <span className="text-[#EF4444] font-bold">{productToDelete?.name}</span>?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] rounded-none hover:bg-slate-100 transition-all border border-slate-200">Abort</button>
                            <button onClick={confirmDelete} className="flex-1 px-6 py-4 bg-[#EF4444] text-white font-bold uppercase tracking-widest text-[10px] rounded-none hover:bg-red-750 transition-all shadow-md active:scale-95">Finalize</button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Sticky Bulk Action Hub --- */}
            {isSelectionMode && selectedProductIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-none p-6 shadow-xl flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#EF4444]/10 rounded-none flex items-center justify-center text-[#EF4444] border border-[#EF4444]/20">
                                <MdBlock size={28} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg tracking-tight leading-none mb-1">Queue Active</h4>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">{selectedProductIds.length} Assets Targeted</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedProductIds([]);
                                }}
                                className="px-6 py-4 text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleBulkDeactivate}
                                className="px-10 py-4 bg-[#EF4444] text-white font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-red-700 shadow-md transition-all active:scale-95"
                            >
                                Finalize Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAllProducts;
