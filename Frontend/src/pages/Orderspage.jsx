import React, { useState, useEffect } from 'react';
import { FaBox, FaCheckCircle, FaTruck, FaTimesCircle, FaClock, FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaShoppingBag, FaChevronDown, FaChevronUp, FaCreditCard, FaSearch, FaHistory, FaDownload, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { MdOutlineReceipt, MdFilterList, MdErrorOutline, MdClose, MdCloudUpload, MdAccountBalance, MdQrCodeScanner, MdOutlinePrivacyTip } from 'react-icons/md';
import API from '../../api';
import placeholderImg from '../assets/Placeholder.png';
import noOrdersImg from '../assets/admin/no_pending_requests.png';
import { formatAddress } from '../utils/addressHelper';
import Skeleton from '../components/Common/Skeleton';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status) => {
    const colors = {
        pending_payment: 'bg-amber-50 text-amber-600 border-amber-100',
        paid: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        packed: 'bg-purple-50 text-purple-600 border-purple-100',
        shipped: 'bg-blue-50 text-blue-600 border-blue-100',
        delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
        cancellation_requested: 'bg-orange-50 text-orange-600 border-orange-100',
        return_requested: 'bg-amber-50 text-amber-700 border-amber-200',
        return_approved: 'bg-teal-50 text-teal-600 border-teal-100',
        returning: 'bg-cyan-50 text-cyan-600 border-cyan-100',
        returned: 'bg-slate-50 text-slate-600 border-slate-200',
        refunded: 'bg-green-50 text-green-700 border-green-100'
    };
    return colors[status] || 'bg-slate-50 text-slate-500 border-slate-100';
};

const getStatusLabel = (status) => {
    const labels = {
        pending_payment: 'Pending Payment',
        paid: 'Processing',
        packed: 'Packed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        cancellation_requested: 'Cancellation Requested',
        return_requested: 'Return Requested',
        return_approved: 'Return Approved',
        returning: 'Returning',
        returned: 'Returned',
        refunded: 'Refunded'
    };
    return labels[status] || status || 'Unknown';
};

const getPaymentMethodLabel = (method) => {
    const methods = {
        cod: 'Cash on Delivery (COD)',
        online: 'Online Payment',
        upi: 'UPI Payment',
        card: 'Credit/Debit Card'
    };
    return methods[method] || method || 'Not Specified';
};

const calculateOrderTotal = (order) => {
    if (!order) return 0;
    return order.totalAmount || 0;
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, thisWeek, lastWeek, thisMonth, custom
    const [customDate, setCustomDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter, customDate]);

    // Cancellation/Return State
    const [actionOrderId, setActionOrderId] = useState(null);
    const [actionType, setActionType] = useState(null); // 'cancel' or 'return'
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Refund details state
    const [refundType, setRefundType] = useState('upi'); // 'upi' or 'bank'
    const [refundUpi, setRefundUpi] = useState('');
    const [refundAccount, setRefundAccount] = useState({
        accountNumber: '',
        ifscCode: '',
        beneficiaryName: ''
    });
    const [returnImages, setReturnImages] = useState([]); // 📸 NEW: Image upload state
    const [useManualRefund, setUseManualRefund] = useState(false); // ⭐ NEW: Toggle for manual refund on online payments

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/orders');
            // Sort by last order first
            const sortedOrders = (response.data.orders || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
            // Dynamic sync for drawer detail view
            setSelectedOrder(prev => {
                if (!prev) return null;
                return sortedOrders.find(o => o._id === prev._id) || prev;
            });
            setError('');
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderAction = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason');
            return;
        }

        const activeOrder = orders.find(o => o._id === actionOrderId);

        // Validation for Refund Details (Standard for COD, Optional for Online via Manual Toggle)
        let refundDetails = null;
        if (activeOrder?.paymentMethod === 'cod' || useManualRefund) {
            if (refundType === 'upi') {
                if (!refundUpi.trim()) {
                    alert('Please provide your UPI ID for settlement.');
                    return;
                }
                refundDetails = { accountType: 'upi', upiId: refundUpi };
            } else {
                if (!refundAccount.accountNumber || !refundAccount.ifscCode || !refundAccount.beneficiaryName) {
                    alert('Please provide complete bank details for secure settlement.');
                    return;
                }
                refundDetails = {
                    accountType: 'bank',
                    ...refundAccount
                };
            }
        }

        try {
            setSubmitting(true);
            const endpoint = actionType === 'cancel' ? `/orders/cancel/${actionOrderId}` : `/orders/return/${actionOrderId}`;

            // 📸 ⭐ USE FORMDATA FOR IMAGE UPLOADS
            const formData = new FormData();
            formData.append('reason', reason);

            if (refundDetails) {
                formData.append('refundAccountDetails', JSON.stringify(refundDetails));
            }

            // Append return images
            if (actionType === 'return' && returnImages.length > 0) {
                returnImages.forEach((img) => {
                    formData.append('images', img);
                });
            }

            await API.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh orders and reset state
            await fetchOrders();
            resetActionState();
        } catch (error) {
            console.error(`Error ${actionType}ing order:`, error);
            alert(error.response?.data?.message || `Failed to ${actionType} order`);
        } finally {
            setSubmitting(false);
        }
    };

    const resetActionState = () => {
        setActionOrderId(null);
        setActionType(null);
        setReason('');
        setRefundType('upi');
        setRefundUpi('');
        setRefundAccount({
            accountNumber: '',
            ifscCode: '',
            beneficiaryName: ''
        });
        setReturnImages([]);
        setUseManualRefund(false);
    };

    const renderOrderCard = (order, idx) => {
        const firstItem = order.items?.[0];
        const itemImage = firstItem?.productId?.images?.[0] || placeholderImg;
        const itemName = firstItem?.productId?.name || 'Standard Product Item';
        const itemPrice = firstItem?.price || firstItem?.productId?.pricing?.selling_price || 0;
        const itemCount = order.items?.length || 0;
        const destinationCity = order.shippingAddress?.city || 'Shipping Address';
        const orderTotal = calculateOrderTotal(order);

        return (
            <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 flex flex-col justify-between h-full"
            >
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                {formatDate(order.createdAt).split(',')[0]}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight font-plus">
                                #{order._id.slice(-8).toUpperCase()}
                            </h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="flex items-center gap-4 py-3 border-y border-slate-50 my-4">
                        <div className="relative w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                            <img
                                src={itemImage}
                                alt={itemName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = placeholderImg; }}
                            />
                            {itemCount > 1 && (
                                <span className="absolute bottom-1 right-1 bg-slate-950 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md">
                                    +{itemCount - 1}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-[#81C784] uppercase tracking-widest block mb-0.5">
                                {firstItem?.productId?.category?.main || 'Elite Piece'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs truncate leading-tight uppercase font-plus">
                                {itemName}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                {firstItem?.quantity || 1} × ₹{itemPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                            <span>Ship to: <span className="text-slate-800 font-bold">{destinationCity}</span></span>
                        </div>
                        <div>
                            <span>Total: <span className="text-slate-950 font-black">₹{orderTotal.toLocaleString()}</span></span>
                        </div>
                    </div>
                </div>

                {/* Inspect Action */}
                <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full mt-2 py-3 bg-slate-50 hover:bg-slate-950 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all duration-300 border border-slate-100 hover:border-slate-950 text-center cursor-pointer"
                >
                    Inspect Order
                </button>
            </div>
        );
    };

    const filteredOrders = orders.filter(order => {
        // Search Term
        const term = searchTerm.toLowerCase().replace('#', '');
        const orderIdMatch = order._id.toLowerCase().includes(term);
        const shortIdMatch = order._id.slice(-8).toLowerCase().includes(term);
        
        // Product Name match
        const productMatch = order.items?.some(item =>
            item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productId?._id?.toLowerCase().includes(term)
        );

        const matchesSearch = !searchTerm ? true : (orderIdMatch || shortIdMatch || productMatch);

        // Status Filter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        // Date Filter
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let matchesDate = true;
        if (dateFilter === 'today') matchesDate = orderDate >= today;
        else if (dateFilter === 'yesterday') matchesDate = orderDate >= yesterday && orderDate < today;
        else if (dateFilter === 'thisWeek') matchesDate = orderDate >= startOfWeek;
        else if (dateFilter === 'lastWeek') matchesDate = orderDate >= startOfLastWeek && orderDate < startOfWeek;
        else if (dateFilter === 'thisMonth') matchesDate = orderDate >= startOfMonth;
        else if (dateFilter === 'custom' && customDate) {
            const selected = new Date(customDate);
            selected.setHours(0, 0, 0, 0);
            const nextDay = new Date(selected);
            nextDay.setDate(selected.getDate() + 1);
            matchesDate = orderDate >= selected && orderDate < nextDay;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    return (
        <div className="w-full space-y-8 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#81C784]/10 rounded-2xl flex items-center justify-center">
                            <FaHistory className="text-[#81C784] text-2xl" />
                        </div>
                        My Orders
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 ml-16">Track your packages and manage returns</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total</p>
                        <p className="text-xl font-black text-gray-900 leading-none">{stats.total}</p>
                    </div>
                    <div className="px-5 py-3 bg-green-50 rounded-2xl border border-green-100 shadow-sm transition-transform hover:scale-105">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Delivered</p>
                        <p className="text-xl font-black text-green-700 leading-none">{stats.delivered}</p>
                    </div>
                </div>
            </div>

            {/* Premium Filter Controls */}
            <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#81C784] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Product Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#81C784]/20 focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 shadow-inner"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-[52px] pl-4 pr-10 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#81C784]/20 focus:outline-none appearance-none font-black text-xs uppercase tracking-wider text-gray-600 cursor-pointer shadow-inner"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="paid">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <MdFilterList className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Date Picker */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 h-[52px] rounded-2xl border-2 border-transparent focus-within:border-[#81C784]/20 shadow-inner">
                            <FaCalendar className="text-gray-300" />
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => {
                                    setCustomDate(e.target.value);
                                    setDateFilter('custom');
                                }}
                                className="bg-transparent border-none outline-none text-xs font-black text-gray-600 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All Orders' },
                        { id: 'today', label: "Today" },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'thisWeek', label: 'This Week' },
                        { id: 'lastWeek', label: 'Last Week' },
                        { id: 'thisMonth', label: 'This Month' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setDateFilter(f.id);
                                setCustomDate('');
                            }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${dateFilter === f.id
                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 scale-105'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Feed */}
            {paginatedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-4 border-dashed border-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <MdErrorOutline className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">No Matching Orders</h3>
                    <p className="text-gray-400 font-bold text-sm">Try adjusting your filters or search term</p>
                    <button
                        onClick={() => {
                            setDateFilter('all');
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCustomDate('');
                        }}
                        className="mt-6 px-6 py-2 bg-[#81C784]/10 text-[#81C784] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#81C784] hover:text-white transition-all"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-16 pb-12">
                    {/* 1. ACTIVE LOGISTICS: Paid, Packed, Shipped */}
                    {paginatedOrders.filter(o => ['paid', 'packed', 'shipped'].includes(o.status)).length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Active Logistics</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 tracking-wider">IN TRANSIT</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedOrders
                                    .filter(o => ['paid', 'packed', 'shipped'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}

                    {/* 2. PENDING SETTLEMENT: Pending Payment, Requested Actions */}
                    {paginatedOrders.filter(o => ['pending_payment', 'cancellation_requested', 'return_requested'].includes(o.status)).length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Pending Settlement</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 tracking-wider">ACTION REQUIRED</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedOrders
                                    .filter(o => ['pending_payment', 'cancellation_requested', 'return_requested'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}

                    {/* 3. REGISTRY ARCHIVE: Delivered, Returned, Cancelled */}
                    {paginatedOrders.filter(o => ['delivered', 'returned', 'refunded', 'cancelled', 'return_approved'].includes(o.status)).length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Registry Archive</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 tracking-wider">LOGGED</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedOrders
                                    .filter(o => ['delivered', 'returned', 'refunded', 'cancelled', 'return_approved'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 rounded-3xl shadow-sm mt-8 animate-in fade-in duration-500">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                                        <span className="font-semibold text-slate-800">
                                            {Math.min(currentPage * ordersPerPage, filteredOrders.length)}
                                        </span>{' '}
                                        of <span className="font-semibold text-slate-800">{filteredOrders.length}</span> orders
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-50 focus:z-20 transition ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <FaArrowLeft className="h-3 w-3" />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                                                    currentPage === page
                                                        ? 'bg-slate-950 text-white shadow-md'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-50 focus:z-20 transition ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <FaArrowLeft className="h-3 w-3 rotate-180" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Slide-over Side Drawer details */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[80] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedOrder(null)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl z-10 flex flex-col animate-slideLeft">
                        {/* Drawer Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                                    Placed on {formatDate(selectedOrder.createdAt)}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 font-plus">
                                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
                            >
                                <MdClose className="text-lg" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
                            {/* Status Timeline Progress */}
                            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Logistics Status
                                    </h4>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-white ${getStatusColor(selectedOrder.status)}`}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span>
                                </div>

                                {/* Modern Progress Bar */}
                                <div className="relative flex justify-between items-center mt-6 px-2">
                                    {/* Progress track */}
                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200/60 rounded-full z-0" />
                                    {/* Active fill */}
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#81C784] rounded-full z-0 transition-all duration-500"
                                        style={{
                                            width: selectedOrder.status === 'delivered' ? '100%' :
                                                   ['shipped', 'returning', 'returned'].includes(selectedOrder.status) ? '66%' :
                                                   ['paid', 'packed'].includes(selectedOrder.status) ? '33%' : '0%'
                                        }}
                                    />

                                    {/* Steps */}
                                    {[
                                        { key: 'placed', label: 'Ordered', icon: FaShoppingBag },
                                        { key: 'processing', label: 'Processing', icon: FaBox },
                                        { key: 'shipped', label: 'Shipped', icon: FaTruck },
                                        { key: 'delivered', label: 'Delivered', icon: FaCheckCircle }
                                    ].map((step, idx) => {
                                        const isCompleted = idx === 0 || 
                                            (idx === 1 && ['paid', 'packed', 'shipped', 'delivered'].includes(selectedOrder.status)) ||
                                            (idx === 2 && ['shipped', 'delivered'].includes(selectedOrder.status)) ||
                                            (idx === 3 && selectedOrder.status === 'delivered');
                                        const StepIcon = step.icon;

                                        return (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                                    isCompleted 
                                                        ? 'bg-white border-[#81C784] text-[#81C784] shadow-md shadow-green-100' 
                                                        : 'bg-white border-slate-200 text-slate-400'
                                                }`}>
                                                    <StepIcon className="text-xs" />
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-wider mt-2 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Manifest Summary */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    Order Items ({selectedOrder.items?.length || 0})
                                    <div className="flex-1 h-[1px] bg-slate-100" />
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => {
                                        const itemImg = item.productId?.images?.[0] || placeholderImg;
                                        const itPrice = item.price || item.productId?.pricing?.selling_price || 0;
                                        return (
                                            <div key={index} className="flex items-center gap-4 p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                                                <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                                                    <img src={itemImg} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight font-plus">{item.productId?.name}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Qty: {item.quantity} × ₹{itPrice.toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs font-black text-slate-900">₹{(itPrice * item.quantity).toLocaleString()}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Delivery & Payment Details */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FaMapMarkerAlt /> Shipping Address
                                    </h4>
                                    <div className="text-xs text-slate-700 space-y-1">
                                        <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName || 'Recipient'}</p>
                                        <p className="leading-relaxed text-slate-600 font-semibold">{formatAddress(selectedOrder.shippingAddress)}</p>
                                        <p className="text-slate-500 font-semibold pt-1">Phone: {selectedOrder.shippingAddress?.phoneNumber || 'No phone provided'}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FaCreditCard /> Payment Channel
                                    </h4>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-700">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                                        <span className="font-black text-slate-900 uppercase">{selectedOrder.paymentStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Total</span>
                                <span className="text-lg font-black text-slate-950">₹{calculateOrderTotal(selectedOrder).toLocaleString()}</span>
                            </div>

                            <div className="flex gap-3">
                                {!['shipped', 'delivered', 'cancelled', 'return_requested', 'cancellation_requested'].includes(selectedOrder.status) && (
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setActionOrderId(selectedOrder._id); 
                                            setActionType('cancel'); 
                                        }}
                                        className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 transition-all text-center cursor-pointer"
                                    >
                                        Terminate Order
                                    </button>
                                )}
                                {selectedOrder.status === 'delivered' && (
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setActionOrderId(selectedOrder._id); 
                                            setActionType('return'); 
                                        }}
                                        className="flex-1 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 transition-all shadow-lg text-center cursor-pointer"
                                    >
                                        Return Order
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all text-center cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {actionOrderId && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-slideUp">
                        {/* Header */}
                        <div className={`relative px-8 py-10 text-white overflow-hidden ${actionType === 'cancel'
                            ? 'bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600'
                            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                            }`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <button
                                onClick={resetActionState}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-sm"
                            >
                                <MdClose className="text-xl" />
                            </button>

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                                    Secure Refund Process
                                </span>
                                <h3 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                    {actionType === 'cancel' ? <MdErrorOutline className="text-white/80" /> : <FaHistory className="text-white/80" />}
                                    {actionType === 'cancel' ? 'Cancel Order' : 'Return Order'}
                                </h3>
                                <p className="text-white/70 font-medium text-sm max-w-md">
                                    {actionType === 'cancel'
                                        ? 'Please provide a reason for cancelling your order.'
                                        : 'Tell us why you want to return this product and upload any photos if necessary.'}
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-10">
                                {/* Reason Segment */}
                                <div>
                                    <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        1. Reason for Request
                                    </h4>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={`Describe the reason for this ${actionType}...`}
                                        className="w-full h-32 px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner"
                                    />
                                </div>

                                {/* Upload Photos (Return Only) */}
                                {actionType === 'return' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            2. Upload Photos
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className="relative flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:bg-slate-100/50 hover:border-amber-300 transition-all group cursor-pointer">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        setReturnImages(prev => [...prev, ...files].slice(0, 5));
                                                    }}
                                                    className="hidden"
                                                />
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-all">
                                                    <MdCloudUpload className="text-2xl" />
                                                </div>
                                                <p className="mt-4 text-[10px] font-bold text-slate-900 tracking-widest uppercase">Select Images</p>
                                                <p className="mt-1 text-[8px] font-bold text-slate-400">(Max 5 images)</p>
                                            </label>

                                            <div className="grid grid-cols-2 gap-2">
                                                {returnImages.map((img, i) => (
                                                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setReturnImages(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdClose className="text-lg" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Refund Details */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            {actionType === 'return' ? '3.' : '2.'} Refund Method
                                        </h4>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Secure Transfer</span>
                                        </div>
                                    </div>

                                    {(orders.find(o => o._id === actionOrderId)?.paymentMethod === 'cod' || useManualRefund) ? (
                                        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                                            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 mb-6">
                                                <button
                                                    onClick={() => setRefundType('upi')}
                                                    className={`flex-1 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest ${refundType === 'upi' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                                >
                                                    UPI ID
                                                </button>
                                                <button
                                                    onClick={() => setRefundType('bank')}
                                                    className={`flex-1 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest ${refundType === 'bank' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                                >
                                                    Bank Account
                                                </button>
                                            </div>

                                            {refundType === 'upi' ? (
                                                <input
                                                    type="text"
                                                    placeholder="Enter UPI ID (e.g. name@bank)"
                                                    value={refundUpi}
                                                    onChange={(e) => setRefundUpi(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm text-slate-700 shadow-sm transition-all"
                                                />
                                            ) : (
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Account Holder Name"
                                                        value={refundAccount.beneficiaryName}
                                                        onChange={(e) => setRefundAccount({ ...refundAccount, beneficiaryName: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm text-slate-700 shadow-sm"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Account Number"
                                                            value={refundAccount.accountNumber}
                                                            onChange={(e) => setRefundAccount({ ...refundAccount, accountNumber: e.target.value })}
                                                            className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="IFSC Code"
                                                            value={refundAccount.ifscCode}
                                                            onChange={(e) => setRefundAccount({ ...refundAccount, ifscCode: e.target.value.toUpperCase() })}
                                                            className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {useManualRefund && (
                                                <button
                                                    onClick={() => setUseManualRefund(false)}
                                                    className="w-full mt-4 text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-all"
                                                >
                                                    ← Revert to Original Payment Method
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-900 rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-bold rounded uppercase tracking-widest">Auto Refund</span>
                                                        <span className="text-[10px] font-bold text-white uppercase italic">Original Payment Method</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-300 leading-relaxed">
                                                        Refund will be processed automatically to your <span className="text-white">original payment source</span> within 5-7 working days.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUseManualRefund(true)}
                                                className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white transition-all"
                                            >
                                                Use different refund method?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={resetActionState}
                                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleOrderAction}
                                disabled={submitting}
                                className={`flex-1 w-full py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all ${submitting
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : actionType === 'cancel'
                                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : `Submit ${actionType === 'cancel' ? 'Cancellation' : 'Return'} Request`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
