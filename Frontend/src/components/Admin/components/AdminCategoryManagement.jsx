import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdImage, MdClose, MdCategory, MdSearch, MdRefresh } from 'react-icons/md';
import { FaLayerGroup } from 'react-icons/fa';
import API from '../../../../api';
import PlaceholderImage from '../../../assets/Placeholder.png';

const AdminCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: null, displayOrder: 0, showInTopbar: false });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await API.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, icon: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('displayOrder', formData.displayOrder);
        data.append('showInTopbar', formData.showInTopbar);
        if (formData.icon) {
            data.append('icon', formData.icon);
        }

        try {
            if (editMode) {
                await API.put(`/categories/update/${currentCategory._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category updated successfully');
            } else {
                await API.post('/categories/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category created successfully');
            }

            fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setFormData({ 
            name: category.name, 
            icon: null, 
            displayOrder: category.displayOrder || 0,
            showInTopbar: category.showInTopbar || false
        });
        setImagePreview(category.icon);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await API.delete(`/categories/delete/${categoryId}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: '', icon: null, displayOrder: 0, showInTopbar: false });
        setImagePreview(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: '', icon: null, displayOrder: 0, showInTopbar: false });
        setImagePreview(null);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Styling constants matching Slate/Indigo Professional Theme (Straight corners)
    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm";
    const labelStyle = "block text-xs font-bold text-slate-550 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-body p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slideUp">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-hero">Category Management</h1>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-650 text-[11px] font-bold uppercase tracking-widest rounded-none border border-indigo-105 hidden md:inline-block">
                            Structure
                        </span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 max-w-md">
                        Organize your store's product hierarchy.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-650 text-white font-bold rounded-none transition-all active:scale-[0.98] text-xs uppercase tracking-widest w-full md:w-auto shadow-sm"
                >
                    <MdAdd className="text-lg" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-none border border-slate-200 shadow-sm animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <div className="relative w-full md:w-96 group">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-none text-slate-700 font-semibold placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={fetchCategories}
                    className="w-full md:w-auto p-4 bg-white border border-slate-200 text-slate-400 rounded-none hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center"
                    title="Refresh Data"
                >
                    <span className="md:hidden font-bold text-xs uppercase tracking-widest mr-2 text-slate-600">Refresh</span>
                    <MdRefresh className="text-xl" />
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-none h-64 border border-slate-200 p-4 animate-pulse"></div>
                    ))
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full bg-white rounded-none p-16 text-center border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-center mx-auto mb-6 text-slate-350">
                            <FaLayerGroup className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-hero">No Categories Found</h3>
                        <p className="text-slate-500 text-sm font-medium">Create your first category to start organizing.</p>
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div
                            key={category._id}
                            className="group bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm hover:border-slate-400 transition-all duration-300"
                        >
                            <div className="h-48 bg-slate-50 overflow-hidden relative border-b border-slate-200">
                                {category.icon ? (
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => { e.target.src = PlaceholderImage; e.target.onerror = null; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                        <MdImage className="text-4xl mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                    </div>
                                )}
                                {/* Desktop Overlay Actions */}
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-3 bg-white text-slate-900 rounded-none hover:bg-indigo-650 hover:text-white transition-all shadow-md"
                                        title="Edit"
                                    >
                                        <MdEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="p-3 bg-[#EF4444] text-white rounded-none hover:bg-red-700 transition-all shadow-md"
                                        title="Delete"
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors font-hero truncate">
                                    {category.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
                                    </div>
                                    {category.showInTopbar && (
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-650 text-[9px] font-bold uppercase tracking-widest border border-indigo-100">
                                            Topbar
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-auto">Order: {category.displayOrder || 0}</span>
                                </div>
                            </div>

                            {/* Mobile Bottom Actions */}
                            <div className="flex md:hidden border-t border-slate-200 divide-x divide-slate-200">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="flex-1 py-4 flex items-center justify-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors active:bg-slate-100"
                                >
                                    <MdEdit className="text-lg" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="flex-1 py-4 flex items-center justify-center gap-2 text-red-650 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors active:bg-slate-100"
                                >
                                    <MdDelete className="text-lg" /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#F8FAFC] w-full max-w-md rounded-none shadow-xl overflow-hidden flex flex-col relative animate-slideUp">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 font-hero">
                                    {editMode ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-xs font-medium text-slate-500 mt-1">Enter category details</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-none transition-colors"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className={labelStyle}>
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={inputStyle}
                                    placeholder="e.g. Necklaces"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                    className={inputStyle}
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-white p-4 border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="showInTopbar"
                                    checked={formData.showInTopbar}
                                    onChange={(e) => setFormData({ ...formData, showInTopbar: e.target.checked })}
                                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                />
                                <label htmlFor="showInTopbar" className="text-xs font-bold text-slate-700 uppercase tracking-widest cursor-pointer">
                                    Show in Topbar Navigation
                                </label>
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    Cover Image
                                </label>
                                <div
                                    className={`
                                        border-2 border-dashed rounded-none p-10 text-center transition-all cursor-pointer relative overflow-hidden group
                                        ${imagePreview ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                                    `}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                            />
                                            <div className="relative z-10">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImagePreview(null);
                                                        setFormData({ ...formData, icon: null });
                                                    }}
                                                    className="w-12 h-12 bg-white border border-slate-200 text-red-650 rounded-none shadow-md flex items-center justify-center mx-auto hover:bg-red-50 hover:scale-105 transition-all"
                                                >
                                                    <MdDelete className="text-xl" />
                                                </button>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mt-3">Remove Image</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="pointer-events-none">
                                            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center mx-auto mb-4 text-slate-350">
                                                <MdImage className="text-3xl" />
                                            </div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Click to upload</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 bg-slate-50 text-slate-600 rounded-none border border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-none font-bold text-xs uppercase tracking-widest hover:bg-indigo-650 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryManagement;
