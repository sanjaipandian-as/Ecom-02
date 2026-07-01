import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaCloudUploadAlt, FaTrash, FaArrowLeft, FaSave, FaTag, FaBoxOpen, FaLayerGroup, FaImage } from 'react-icons/fa';
import API from '../../../../api';

const CATEGORIES = [
    { value: 'Body Care', label: 'Body Care' },
    { value: 'Skin Care', label: 'Skin Care' },
    { value: 'Face Care', label: 'Face Care' },
    { value: 'Hair Care', label: 'Hair Care' },
];

const isVideo = (path) => {
    if (!path || typeof path !== 'string') return false;
    if (path.includes('#video')) return true;
    if (path.startsWith('data:video/')) return true;
    const cleanPath = path.split('?')[0].split('#')[0].toLowerCase();
    const ext = cleanPath.split('.').pop();
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
};

const AdminProductUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        category: {
            main: '',
            sub: ''
        },
        pricing: {
            mrp: '',
            selling_price: ''
        },
        stock: '',
        tags: '',
        is_featured: false,
        specifications: [{ key: '', value: '' }]
    });

    const [images, setImages] = useState([]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) || '' : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const isVid = file.type.startsWith('video/');
                setImagePreview(prev => [...prev, reader.result + (isVid ? '#video' : '#image')]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecificationChange = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!formData.category.main) {
            toast.error('Please select a category');
            return;
        }

        if (!formData.pricing.mrp || !formData.pricing.selling_price) {
            toast.error('Please enter pricing details');
            return;
        }

        if (parseFloat(formData.pricing.selling_price) > parseFloat(formData.pricing.mrp)) {
            toast.error('Selling price cannot be greater than MRP');
            return;
        }

        if (images.length < 2) {
            toast.error('Please upload at least 2 product media files');
            return;
        }

        if (images.length > 5) {
            toast.error('Maximum 5 media files allowed');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();

            images.forEach(image => {
                submitData.append('images', image);
            });

            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('brand', formData.brand);
            Object.keys(formData.category).forEach(key => {
                submitData.append(`category[${key}]`, formData.category[key]);
            });
            Object.keys(formData.pricing).forEach(key => {
                submitData.append(`pricing[${key}]`, formData.pricing[key]);
            });
            submitData.append('stock', formData.stock || 0);
            submitData.append('is_featured', formData.is_featured);

            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            submitData.append('tags', JSON.stringify(tagsArray));

            const validSpecs = formData.specifications.filter(spec => spec.key && spec.value);
            submitData.append('specifications', JSON.stringify(validSpecs));

            await API.post('/admin/products', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Product uploaded successfully!');
            navigate('/admin-dashboard');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload product');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-5 py-4 rounded-none bg-white border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-medium font-body text-base md:text-sm shadow-sm hover:border-indigo-305";
    const labelClasses = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 font-hero";
    const sectionClasses = "bg-white rounded-none border border-slate-200 p-5 md:p-8 shadow-sm hover:border-slate-300 transition-colors animate-slideUp";

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-body">
            <div className="max-w-7xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-xl py-4 border-b border-white/0 animate-slideUp">
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate('/admin-dashboard')}
                                className="flex items-center gap-2 text-slate-450 hover:text-indigo-650 transition-colors mb-2 font-bold text-[10px] uppercase tracking-widest font-hero group"
                            >
                                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-hero">Add New Product</h1>
                            <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Create a new product card for your store inventory.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/admin-dashboard')}
                                className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-none hover:bg-white hover:text-slate-900 transition-all text-xs uppercase tracking-widest hover:shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-none border border-slate-900 hover:bg-indigo-650 hover:border-indigo-650 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm text-xs uppercase tracking-widest"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        <span>Save Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6 md:space-y-8">

                            {/* General Info */}
                            <div className={sectionClasses} style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 font-hero">
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 text-indigo-650 rounded-none">
                                        <FaBoxOpen className="text-lg" />
                                    </div>
                                    General Information
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Product Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="e.g. Vintage Leather Jacket"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Description <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={`${inputClasses} h-40 resize-none leading-relaxed`}
                                            placeholder="Write a compelling description for your product that highlights its best features..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className={sectionClasses} style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 font-hero">
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 text-indigo-650 rounded-none">
                                        <FaImage className="text-lg" />
                                    </div>
                                    Product Media
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ml-auto px-4 py-2 rounded-none border transition-all shadow-sm flex items-center gap-2 ${imagePreview.length >= 2 && imagePreview.length <= 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-150 animate-pulse' : 'bg-red-50 text-red-700 border-red-150 animate-pulse'}`}>
                                        <FaCloudUploadAlt className="text-sm" />
                                        {imagePreview.length} / 5 Files (Min: 2)
                                    </span>
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {imagePreview.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                                {isVideo(preview) ? (
                                                    <video
                                                        src={preview.split('#')[0]}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                        autoPlay
                                                    />
                                                ) : (
                                                    <img
                                                        src={preview.split('#')[0]}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white text-red-650 rounded-none border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                                {index === 0 && (
                                                    <div className="absolute top-3 left-3 bg-slate-900 border border-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-none shadow-sm font-hero">
                                                        Main
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {imagePreview.length < 5 && (
                                            <label className="aspect-square bg-slate-50 border border-dashed border-slate-350 hover:border-indigo-500 hover:bg-indigo-50/5 rounded-none flex flex-col items-center justify-center cursor-pointer transition-all group">
                                                <div className="w-14 h-14 bg-white border border-slate-200 text-slate-300 group-hover:border-indigo-305 group-hover:text-indigo-600 rounded-none flex items-center justify-center mb-3 transition-colors shadow-sm duration-300">
                                                    <FaCloudUploadAlt size={24} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-650 text-center px-2 uppercase tracking-widest font-hero">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    multiple
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 bg-slate-50 p-4 rounded-none border border-slate-200 text-center uppercase tracking-wide font-hero">
                                        ✨ High-quality square images and videos preferred. Max 5.
                                    </p>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className={sectionClasses} style={{ animationDelay: '0.3s' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Pricing */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-2 border-b border-slate-100 pb-3 font-hero">
                                            Pricing Strategy
                                        </h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className={labelClasses}>MRP (Before Discount) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        name="pricing.mrp"
                                                        value={formData.pricing.mrp}
                                                        onChange={handleInputChange}
                                                        className={`${inputClasses} pl-10`}
                                                        placeholder="0.00"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Selling Price (After Discount) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        name="pricing.selling_price"
                                                        value={formData.pricing.selling_price}
                                                        onChange={handleInputChange}
                                                        className={`${inputClasses} pl-10`}
                                                        placeholder="0.00"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            {formData.pricing.mrp && formData.pricing.selling_price && (
                                                <div className="flex items-center gap-3 text-xs font-bold bg-emerald-50 text-emerald-700 px-5 py-4 rounded-none border border-emerald-150 animate-fadeIn">
                                                    <div className="p-1.5 bg-emerald-100 border border-emerald-250 rounded-none"><FaTag size={12} /></div>
                                                    <span>
                                                        You are offering a <span className="font-bold">{Math.round(((formData.pricing.mrp - formData.pricing.selling_price) / formData.pricing.mrp) * 100)}% Discount</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inventory */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-2 border-b border-slate-100 pb-3 font-hero">
                                            Stock Control
                                        </h2>
                                        <div>
                                            <label className={labelClasses}>Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                className={inputClasses}
                                                placeholder="e.g. 100"
                                                min="0"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide font-hero">Number of units currently available.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className={sectionClasses} style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-200 pb-4">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3 font-hero">
                                        <div className="p-2.5 bg-slate-50 border border-slate-200 text-indigo-650 rounded-none">
                                            <FaLayerGroup className="text-lg" />
                                        </div>
                                        Technical Specs
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addSpecification}
                                        className="text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900 border border-slate-900 hover:bg-indigo-650 px-5 py-2.5 rounded-none transition-colors shadow-sm active:scale-95"
                                    >
                                        + Add Spec
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center group animate-fadeIn">
                                            <div className="flex-1 w-full">
                                                <input
                                                    type="text"
                                                    value={spec.key}
                                                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                                    className={inputClasses}
                                                    placeholder="Key (e.g. Material)"
                                                />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <input
                                                    type="text"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                                    className={inputClasses}
                                                    placeholder="Value (e.g. Cotton)"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(index)}
                                                className="self-end sm:self-auto text-slate-400 hover:text-red-650 p-2 border border-transparent hover:border-slate-200 hover:bg-slate-100 transition-colors rounded-none"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.specifications.length === 0 && (
                                        <div className="text-center py-10 bg-slate-50/50 rounded-none border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 font-bold mb-1">No specifications added yet.</p>
                                            <p className="text-[10px] text-slate-350 font-bold uppercase tracking-widest font-hero">Add details like Material, Size, etc.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6 md:space-y-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>

                            {/* Organization */}
                            <div className="bg-white rounded-none border border-slate-200 p-5 md:p-8 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 font-hero">
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 text-indigo-650 rounded-none">
                                        <FaTag className="text-lg" />
                                    </div>
                                    Category & Tags
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Main Category <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={handleInputChange}
                                                className={`${inputClasses} appearance-none cursor-pointer`}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Sub Category</label>
                                        <input
                                            type="text"
                                            name="category.sub"
                                            value={formData.category.sub}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="e.g. Shirts"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Search Tags</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="cotton, summer, sale"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide font-hero">Comma separated keywords.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-none border border-slate-200 p-5 md:p-8 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 font-hero">
                                    Visibility
                                </h2>
                                <div className="space-y-4">
                                    <label className={`
                                        flex items-center gap-4 p-5 border rounded-none cursor-pointer transition-all duration-300
                                        ${formData.is_featured
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                            : 'bg-slate-50 border-slate-200 hover:border-indigo-305'
                                        }
                                    `}>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={handleInputChange}
                                                className="peer sr-only"
                                            />
                                            <div className={`w-6 h-6 rounded-none border flex items-center justify-center transition-all ${formData.is_featured ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                {formData.is_featured && <FaPlus className="text-white text-[10px]" />}
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`block text-sm font-bold ${formData.is_featured ? 'text-indigo-900' : 'text-slate-750'}`}>Featured Product</span>
                                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${formData.is_featured ? 'text-indigo-650/80' : 'text-slate-400'} font-hero`}>Display on homepage</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductUpload;
