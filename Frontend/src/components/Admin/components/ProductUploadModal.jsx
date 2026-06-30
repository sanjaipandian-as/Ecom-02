import React, { useState, useEffect } from 'react';
import { FaTimes, FaCloudUploadAlt, FaTrash, FaInfoCircle, FaRupeeSign, FaTag, FaPlus, FaCheck, FaBox } from 'react-icons/fa';
import { MdPalette, MdCategory, MdStraighten, MdKeyboardArrowDown, MdCheck } from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

const CustomSelect = ({ label, name, value, options, onChange, placeholder, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative group" ref={dropdownRef}>
            {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover:text-indigo-600 font-hero">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 bg-white border rounded-none text-base md:text-sm font-semibold cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm
                    ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500/10' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'}
                    ${!value ? 'text-slate-400' : 'text-slate-800'}
                `}
            >
                <span className="truncate flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
                <MdKeyboardArrowDown className={`text-2xl transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-none shadow-md overflow-hidden animate-slideUpOriginTop transform origin-top max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 mb-2 bg-slate-50/70 sticky top-0 backdrop-blur-sm font-hero">
                        {placeholder}
                    </div>
                    <div className="p-2">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`
                                    px-4 py-3 rounded-none text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-between mb-1
                                    ${value === opt.value
                                        ? 'bg-indigo-55 text-indigo-700 border border-indigo-100 shadow-sm font-bold'
                                        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}
                                `}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <MdCheck className="text-xl text-indigo-650" />}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center italic">No options available</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductUploadModal = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: { main: '', sub: '' },
        pricing: { mrp: '', cost: '', selling_price: '' },
        stock: '',
        images: [],
        brand: '',
        sku: '',
        tags: [],
        specifications: [],
        colors: [],
        sizes: [],
        weight: '',
        displayWeight: '',
        productType: '',
        howToUse: '',
        ingredients: '',
        gender: '',
        is_featured: false,
        is_new_arrival: false,
        showInTopSelling: false,
        showInViral: false
    });

    const [activeTab, setActiveTab] = useState('general');
    const [previewImages, setPreviewImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.get('/categories');
                setAvailableCategories(response.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            }
        };

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    ...productToEdit,
                    category: productToEdit.category || { main: '', sub: '' },
                    pricing: productToEdit.pricing || { mrp: '', cost: '', selling_price: '' },
                    tags: productToEdit.tags || [],
                    specifications: productToEdit.specifications || [],
                    colors: productToEdit.colors || [],
                    sizes: productToEdit.sizes || [],
                    images: productToEdit.images || [],
                    sku: productToEdit.sku || '',
                    displayWeight: productToEdit.displayWeight || '',
                    productType: productToEdit.productType || '',
                    howToUse: productToEdit.howToUse || '',
                    ingredients: productToEdit.ingredients || '',
                });
                setPreviewImages(productToEdit.images || []);
            } else {
                resetForm();
            }
            setActiveTab('general');
        }
    }, [productToEdit, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: { main: '', sub: '' },
            pricing: { mrp: '', cost: '', selling_price: '' },
            stock: '',
            images: [],
            brand: 'Anti Turnish Jewellery',
            tags: [],
            specifications: [],
            colors: [],
            sizes: [],
            weight: '',
            sku: '',
            displayWeight: '',
            productType: '',
            howToUse: '',
            ingredients: '',
            gender: '',
            is_featured: false,
            is_new_arrival: false,
            showInTopSelling: false,
            showInViral: false
        });
        setPreviewImages([]);
        setNewImages([]);
        setTagInput('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));

        if (index < formData.images.length && !newImages.length) {
            const updatedImages = formData.images.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, images: updatedImages }));
        } else {
            const newImageIndex = index - (formData.images.length || 0);
            if (newImageIndex >= 0) {
                setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
            } else {
                const updatedImages = formData.images.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, images: updatedImages }));
            }
        }
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpec = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const removeSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const totalImages = formData.images.length + newImages.length;
        if (totalImages < 2) {
            toast.error('At least 2 images are required');
            return;
        }
        if (totalImages > 8) {
            toast.error('Maximum 8 images allowed');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === 'category' || key === 'pricing') {
                    Object.keys(formData[key]).forEach(subKey => {
                        data.append(`${key}[${subKey}]`, formData[key][subKey]);
                    });
                } else if (key === 'images') {
                    formData.images.forEach(img => data.append('existingImages[]', img));
                } else if (Array.isArray(formData[key])) {
                    if (key === 'specifications') {
                        data.append(key, JSON.stringify(formData[key]));
                    } else {
                        formData[key].forEach(item => data.append(`${key}[]`, item));
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });

            newImages.forEach(image => {
                data.append('images', image);
            });

            if (productToEdit) {
                await API.put(`/admin/products/${productToEdit._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully!');
            } else {
                await API.post('/admin/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product added successfully!');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            const errData = error.response?.data;
            if (errData?.received) {
                const missing = Object.keys(errData.received).filter(k => !errData.received[k]);
                toast.error(`Missing fields: ${missing.join(', ')}`);
            } else {
                toast.error(errData?.message || 'Failed to save product');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: FaInfoCircle },
        { id: 'pricing', label: 'Pricing & Stock', icon: FaRupeeSign },
        { id: 'media', label: 'Media', icon: MdPalette },
        { id: 'attributes', label: 'Attributes', icon: FaTag },
    ];

    const inputClasses = "w-full px-5 py-4 bg-white border border-slate-200 rounded-none text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-350 text-sm hover:border-indigo-300 shadow-sm";
    const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 font-hero";
    const sectionClasses = "bg-white p-6 md:p-8 rounded-none border border-slate-200 shadow-sm mb-8";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-body animate-fadeIn">
            <div className="bg-[#F8FAFC] w-full max-w-4xl h-[85vh] md:h-[90vh] rounded-none shadow-lg overflow-hidden flex flex-col relative animate-slideUp border border-slate-250">

                {/* Header */}
                <div className="px-6 py-5 md:px-10 md:py-6 bg-white border-b border-slate-200 flex justify-between items-center z-20">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-hero tracking-tight">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider font-hero">
                            {productToEdit ? 'Update details' : 'Create new listing'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-none hover:bg-red-600 hover:text-white border border-slate-200 hover:border-red-650 transition-all hover:rotate-90 shadow-sm"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 md:px-10 bg-white border-b border-slate-200 flex gap-3 md:gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-none text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 border ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon className={`text-base md:text-lg ${activeTab === tab.id ? 'text-white' : 'text-slate-450'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#F8FAFC]">
                    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Product Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Premium Silk Saree"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Brand <span className="text-red-500">*</span></label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    value="Anti Turnish Jewellery"
                                                    readOnly
                                                    className={`${inputClasses} bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed pl-10`}
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 bg-white border border-slate-200 p-1 rounded-none shadow-sm">
                                                    <FaTag size={12} />
                                                </div>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-60 font-hero">
                                                    Locked
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>SKU <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. PROD-001"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <CustomSelect
                                                label="Target Audience"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                placeholder="Select Target"
                                                options={[
                                                    { value: 'Men', label: 'Men' },
                                                    { value: 'Women', label: 'Women' },
                                                    { value: 'Unisex', label: 'Unisex' },
                                                    { value: 'Kids', label: 'Kids' }
                                                ]}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 font-hero border-b border-slate-100 pb-2">Product Visibility & Status</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        id="is_featured"
                                                        name="is_featured"
                                                        checked={formData.is_featured}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                                    />
                                                    <label htmlFor="is_featured" className="text-[10px] font-bold text-slate-700 uppercase tracking-widest cursor-pointer">Featured</label>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        id="is_new_arrival"
                                                        name="is_new_arrival"
                                                        checked={formData.is_new_arrival}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                                    />
                                                    <label htmlFor="is_new_arrival" className="text-[10px] font-bold text-slate-700 uppercase tracking-widest cursor-pointer">New Arrival</label>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        id="showInTopSelling"
                                                        name="showInTopSelling"
                                                        checked={formData.showInTopSelling}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                                    />
                                                    <label htmlFor="showInTopSelling" className="text-[10px] font-bold text-slate-700 uppercase tracking-widest cursor-pointer">Best Seller</label>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        id="showInViral"
                                                        name="showInViral"
                                                        checked={formData.showInViral}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                                    />
                                                    <label htmlFor="showInViral" className="text-[10px] font-bold text-slate-700 uppercase tracking-widest cursor-pointer">Viral Product</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Description <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="5"
                                                className={`${inputClasses} resize-none leading-relaxed`}
                                                placeholder="Write a compelling description..."
                                                required
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Display Weight</label>
                                            <input
                                                type="text"
                                                name="displayWeight"
                                                value={formData.displayWeight}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. 50g, 100ml"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Product Type</label>
                                            <input
                                                type="text"
                                                name="productType"
                                                value={formData.productType}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Premium, Standard"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>How to Use</label>
                                            <textarea
                                                name="howToUse"
                                                value={formData.howToUse}
                                                onChange={handleChange}
                                                rows="3"
                                                className={`${inputClasses} resize-none leading-relaxed`}
                                                placeholder="Provide application instructions..."
                                            ></textarea>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Ingredients</label>
                                            <textarea
                                                name="ingredients"
                                                value={formData.ingredients}
                                                onChange={handleChange}
                                                rows="3"
                                                className={`${inputClasses} resize-none leading-relaxed`}
                                                placeholder="List ingredients..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 font-hero flex items-center gap-2.5 border-b border-slate-200 pb-4">
                                        <div className="p-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-none"><MdCategory /></div>
                                        Categorization
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div>
                                            <CustomSelect
                                                label="Main Category"
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={(e) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        category: { ...prev.category, main: e.target.value }
                                                    }));
                                                }}
                                                placeholder="Select Category"
                                                options={availableCategories.map(cat => ({
                                                    value: cat.name,
                                                    label: cat.name
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Sub Category</label>
                                            <input
                                                type="text"
                                                name="category.sub"
                                                value={formData.category.sub}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Shirts, Dresses"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRICING TAB */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 font-hero flex items-center gap-2.5 border-b border-slate-200 pb-4">
                                        <div className="p-2 bg-slate-50 border border-slate-200 text-slate-750 rounded-none"><FaRupeeSign /></div>
                                        Price & Inventory
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClasses}>MRP</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.mrp"
                                                    value={formData.pricing.mrp}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Selling Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-650 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.selling_price"
                                                    value={formData.pricing.selling_price}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8 bg-slate-50/10 border-slate-200 focus:border-indigo-500`}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Cost Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.cost"
                                                    value={formData.pricing.cost}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1.5">
                                            <label className={labelClasses}>Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-1.5">
                                            <label className={labelClasses}>Weight (kg)</label>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MEDIA TAB */}
                        {activeTab === 'media' && (
                            <div className="animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="border-2 border-dashed border-slate-300 rounded-none p-8 md:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/5 transition-all cursor-pointer relative group bg-slate-50">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                            accept="image/*"
                                        />
                                        <div className="w-20 h-20 bg-white rounded-none border border-slate-200 flex items-center justify-center mx-auto mb-5 group-hover:scale-102 transition-transform duration-305">
                                            <FaCloudUploadAlt className="text-4xl text-indigo-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 font-hero mb-2 group-hover:text-indigo-650 transition-colors">Upload Photos</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 font-hero">Supports JPG, PNG, WEBP (Min 2, Max 8)</p>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-none border text-[10px] font-bold uppercase tracking-widest transition-all font-hero ${previewImages.length >= 2 && previewImages.length <= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-red-50 text-red-700 border-red-150 animate-pulse'}`}>
                                            {previewImages.length} / 8 Selected
                                        </div>
                                    </div>

                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                            {previewImages.map((src, index) => (
                                                <div key={index} className="relative group rounded-none overflow-hidden aspect-square border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                                    <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-3 right-3 p-2.5 bg-white text-red-650 rounded-none border border-slate-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ATTRIBUTES TAB */}
                        {activeTab === 'attributes' && (
                            <div className="animate-fadeIn space-y-8">
                                <div className={sectionClasses}>
                                    <label className={labelClasses}>Search Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="px-4 py-2 bg-white border border-slate-250 text-slate-700 rounded-none text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm animate-popIn font-hero">
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-650 transition-colors">
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagAdd}
                                        className={inputClasses}
                                        placeholder="Type keyword and press Enter..."
                                    />
                                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 font-hero">
                                        Keywords help customers find your product.
                                    </p>
                                </div>

                                <div className={sectionClasses}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-hero">Specifications</h3>
                                        <button
                                            type="button"
                                            onClick={addSpec}
                                            className="text-xs font-bold uppercase tracking-widest text-slate-700 bg-white hover:bg-slate-100 px-4 py-2 rounded-none transition-all flex items-center gap-2 border border-slate-200 shadow-sm"
                                        >
                                            <FaPlus /> Add Spec
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 animate-slideUp">
                                                <input
                                                    type="text"
                                                    placeholder="Key (e.g. Material)"
                                                    value={spec.key}
                                                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                                    className={inputClasses}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. Cotton)"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                    className={inputClasses}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpec(index)}
                                                    className="p-4 bg-red-50 border border-red-150 text-red-650 rounded-none hover:bg-red-650 hover:text-white transition-all self-end md:self-auto shadow-sm"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.specifications.length === 0 && (
                                            <div className="text-center py-10 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-hero">No specifications added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 md:px-10 md:py-6 bg-white border-t border-slate-200 flex justify-end gap-4 z-20 shadow-sm">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 md:px-8 py-3.5 bg-white text-slate-650 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-none hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 md:px-10 py-3.5 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-none border border-slate-900 hover:bg-indigo-650 hover:border-indigo-650 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaCheck /> {productToEdit ? 'Update Product' : 'Save Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductUploadModal;
