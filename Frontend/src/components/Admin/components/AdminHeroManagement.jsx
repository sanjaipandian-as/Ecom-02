import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdAdd, MdImage, MdSave, MdCancel, MdViewCarousel } from 'react-icons/md';
import API from '../../../../api';
import PlaceholderImage from '../../../assets/Placeholder.png';

const AdminHeroManagement = ({ refreshId }) => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        order: 0,
        image: null,
        product: ''
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchSlides();
        fetchProducts();
    }, [refreshId]);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await API.get('/hero');
            setSlides(response.data.slides || []);
        } catch (error) {
            console.error('Error fetching slides:', error);
            toast.error('Failed to load hero slides');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await API.get('/products/customer');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleOpenModal = (slide = null) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                order: slide.order,
                image: null,
                product: slide.product?._id || slide.product || ''
            });
            setPreviewImage(slide.image);
        } else {
            setEditingSlide(null);
            setFormData({
                order: slides.length + 1,
                image: null,
                product: ''
            });
            setPreviewImage(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSlide(null);
        setFormData({
            order: 0,
            image: null,
            product: ''
        });
        setPreviewImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('order', formData.order);
        data.append('product', formData.product);
        
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingSlide) {
                await API.put(`/hero/${editingSlide._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide updated successfully');
            } else {
                await API.post('/hero', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide created successfully');
            }
            fetchSlides();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving slide:', error);
            toast.error('Failed to save slide');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slide?")) return;
        try {
            await API.delete(`/hero/${id}`);
            toast.success('Slide deleted successfully');
            fetchSlides();
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error('Failed to delete slide');
        }
    };

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen font-body text-slate-900">
            {/* Header */}
            <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 animate-slideUp">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-hero">Hero Section</h1>
                    <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">Manage the rotating banners on your home page</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-slate-900 hover:bg-indigo-650 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-none border border-slate-900 hover:border-indigo-650 transition-all shadow-sm active:scale-[0.98]"
                >
                    <MdAdd className="text-lg" />
                    Add New Slide
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-none h-[300px] border border-slate-200 animate-pulse"></div>
                    ))}
                </div>
            ) : slides.length === 0 ? (
                <div className="bg-white rounded-none border border-slate-200 p-20 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center mb-6 text-slate-355 shadow-inner">
                        <MdViewCarousel className="text-5xl" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-hero">No Slides Active</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider max-w-xs font-hero">Add your first banner image to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    {slides.map((slide) => (
                        <div key={slide._id} className="group bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 relative flex flex-col cursor-pointer">
                            {/* Image Section */}
                            <div className="relative aspect-[21/9] bg-slate-100 overflow-hidden">
                                <img
                                    src={slide.image}
                                    alt="Hero Slide"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = PlaceholderImage; e.target.onerror = null; }}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="backdrop-blur-md bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none border border-white/10 shadow-sm font-hero">
                                        Order: {slide.order}
                                    </span>
                                </div>
                                {/* Desktop Hover Actions */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(slide); }}
                                        className="p-3 bg-white text-slate-900 rounded-none hover:scale-105 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                        title="Edit Slide"
                                    >
                                        <MdEdit className="text-lg" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(slide._id); }}
                                        className="p-3 bg-white text-red-600 rounded-none hover:scale-105 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                        title="Delete Slide"
                                    >
                                        <MdDelete className="text-lg" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Bottom Actions */}
                            <div className="flex md:hidden p-3 gap-3 bg-white border-t border-slate-200">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(slide); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-slate-100 transition-all active:bg-slate-200"
                                >
                                    <MdEdit className="text-base" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(slide._id); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-red-100 transition-all active:bg-red-200"
                                >
                                    <MdDelete className="text-base" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-none w-[95%] md:w-full max-w-lg shadow-lg border border-slate-250 mx-auto">
                        <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-200 flex justify-between items-center bg-white z-10">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight font-hero">
                                    {editingSlide ? 'Edit Banner' : 'New Banner'}
                                </h2>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 font-hero">Banner Settings</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 md:w-10 md:h-10 rounded-none bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-650 flex items-center justify-center transition-all">
                                <MdCancel size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 md:space-y-8">
                            {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-hero">Banner Image</label>
                                <div className="relative aspect-[21/9] bg-slate-50 rounded-none border-2 border-dashed border-slate-350 hover:border-indigo-500 hover:bg-indigo-50/5 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-none flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-102 transition-transform">
                                                <MdImage className="text-3xl text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600">Click to upload image</p>
                                            <p className="text-xs text-slate-400 mt-1">Recommended size for banners</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Product Selection */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-hero">Link to Product</label>
                                <select
                                    name="product"
                                    value={formData.product}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 outline-none font-semibold text-slate-900 transition-all appearance-none"
                                >
                                    <option value="">No Product Linked</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} (₹{p.pricing?.selling_price})</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 font-medium">When users click the banner, they will be navigated to this product.</p>
                            </div>

                            {/* Display Order */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-hero">Display Order (Index)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 outline-none font-semibold text-slate-900 transition-all"
                                        min="0"
                                        placeholder="e.g. 1"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-none pointer-events-none font-hero">
                                        Index
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col-reverse md:flex-row gap-3 md:gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-650 font-bold uppercase tracking-widest text-xs rounded-none hover:bg-slate-100 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-slate-900 hover:bg-indigo-650 text-white font-bold uppercase tracking-widest text-xs rounded-none border border-slate-900 hover:border-indigo-650 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <MdSave className="text-lg" />
                                    {editingSlide ? 'Update Banner' : 'Save Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHeroManagement;
