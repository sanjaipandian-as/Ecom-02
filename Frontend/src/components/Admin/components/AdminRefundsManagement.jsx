import React, { useState, useEffect } from 'react';
import {
    MdAssignmentReturn,
    MdCancel,
    MdRefresh,
    MdSearch,
    MdFilterList,
    MdCheckCircle,
    MdClose,
    MdInfo,
    MdAttachMoney,
    MdDateRange,
    MdHistory,
    MdWarning,
    MdArrowForward,
    MdReceipt,
    MdVisibility,
    MdOutlineErrorOutline,
    MdCloudUpload
} from 'react-icons/md';
import API from '../../../../api';

const AdminRefundsManagement = ({ refreshId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('requests'); // requests, processing, historical

    useEffect(() => {
        fetchSpecialOrders();
    }, [refreshId]);

    const fetchSpecialOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/orders');
            const specialOrders = (response.data || []).filter(order =>
                ['cancellation_requested', 'return_requested', 'return_approved', 'refund_initiated', 'refunded', 'cancelled', 'returned', 'return_rejected'].includes(order.status)
            );
            setOrders(specialOrders);
        } catch (error) {
            console.error('Error fetching refund/cancel orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            setActionLoading(true);
            await API.put(`/admin/orders/${orderId}`, { status });
            await fetchSpecialOrders();
            setSelectedOrderId(null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const requests = filteredOrders.filter(o =>
        ['cancellation_requested', 'return_requested'].includes(o.status)
    );

    const processing = filteredOrders.filter(o =>
        ['return_approved', 'refund_initiated'].includes(o.status)
    );

    const historical = filteredOrders.filter(o =>
        ['cancelled', 'returned', 'refunded', 'return_rejected'].includes(o.status)
    );

    const getActiveOrders = () => {
        switch (activeTab) {
            case 'requests': return requests;
            case 'processing': return processing;
            case 'historical': return historical;
            default: return filteredOrders;
        }
    };

    const OrderCard = ({ order, isExpanded, onToggle }) => {
        const isPending = ['cancellation_requested', 'return_requested'].includes(order.status);
        const orderID = order._id.slice(-8).toUpperCase();

        return (
            <div
                onClick={() => !isExpanded && onToggle(order._id)}
                className={`group bg-white rounded-none border transition-all duration-300 relative overflow-hidden flex flex-col ${isExpanded
                    ? 'lg:col-span-2 border-slate-950 shadow-md p-0 animate-fadeIn'
                    : `p-6 cursor-pointer hover:shadow-sm ${isPending ? 'border-red-200 hover:border-red-400 bg-red-50/5' : 'border-slate-200'}`
                    }`}
            >
                {/* Close Button */}
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(null); }}
                        className="absolute top-6 right-6 w-10 h-10 rounded-none bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 hover:bg-red-600 hover:text-white transition-all z-50 active:scale-95"
                    >
                        <MdClose size={20} />
                    </button>
                )}

                {isExpanded ? (
                    <div className="flex flex-col md:flex-row h-full">
                        {/* 📸 Photos Section */}
                        <div className="md:w-1/2 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-200">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white rounded-none border border-slate-200 text-indigo-650">
                                    <MdVisibility size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight font-hero">Request Photos</h3>
                            </div>

                            {order.returnImages && order.returnImages.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="aspect-square rounded-none overflow-hidden border border-slate-200 bg-white group/img cursor-pointer" onClick={() => window.open(order.returnImages[0], '_blank')}>
                                        <img
                                            src={order.returnImages[0]}
                                            alt="Return"
                                            className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {order.returnImages.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-none overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-500 transition-all" onClick={() => window.open(img, '_blank')}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center bg-white/50 rounded-none border border-dashed border-slate-300">
                                    <MdCloudUpload size={40} className="text-slate-300 mb-2" />
                                    <p className="text-sm font-semibold text-slate-500 font-hero">No images provided by customer</p>
                                </div>
                            )}
                        </div>

                        {/* ⚖️ Details & Actions Section */}
                        <div className="md:w-1/2 p-8 flex flex-col bg-white">
                            <div className="mb-8">
                                <span className="inline-block px-3 py-1 rounded-none border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-3 font-hero">
                                    Order #{orderID}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-hero">Process Request</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <p className="text-slate-500 text-sm">Review the details and take necessary action.</p>
                                    {order.deliveryAttempted === false && (
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-none uppercase tracking-widest border border-emerald-150">
                                            Never Delivered
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 flex-1">
                                {/* Reason Box */}
                                <div className="bg-slate-50 p-6 rounded-none border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-hero">Customer Reason</p>
                                    <p className="text-slate-800 font-medium leading-relaxed italic">
                                        "{order.cancelReason || order.returnReason || 'No reason provided.'}"
                                    </p>
                                </div>

                                {/* Financial Settlement */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900 border border-slate-900 rounded-none p-5 text-white shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">Refund Amount</p>
                                            <p className="text-2xl font-bold">₹{(order.totalAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-none p-5 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">Orig. Payment</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase">{order.paymentMethod || 'Online'}</p>
                                        </div>
                                    </div>

                                    {/* Bank/UPI Info */}
                                    {order.refundAccountDetails && (
                                        <div className="bg-white border border-slate-200 p-6 rounded-none shadow-sm">
                                            {order.refundAccountDetails.accountType === 'upi' ? (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">UPI ID</p>
                                                        <p className="text-lg font-bold text-slate-900 select-all">{order.refundAccountDetails.upiId}</p>
                                                    </div>
                                                    <MdReceipt className="text-slate-200" size={32} />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">A/C Holder</p>
                                                        <p className="text-md font-bold text-slate-900">{order.refundAccountDetails.beneficiaryName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">Account No.</p>
                                                        <p className="text-sm font-bold text-slate-900 select-all">{order.refundAccountDetails.accountNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">IFSC Code</p>
                                                        <p className="text-sm font-bold text-slate-900 select-all uppercase">{order.refundAccountDetails.ifscCode}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid gap-3 pt-4">
                                    {order.status === 'cancellation_requested' && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const nextStatus = order.paymentStatus === 'success' ? 'refund_initiated' : 'cancelled';
                                                    handleUpdateStatus(order._id, nextStatus);
                                                }}
                                                className="w-full py-4 bg-red-600 border border-red-600 text-white font-bold rounded-none hover:bg-red-700 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                                            >
                                                Approve Cancellation <MdCheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'paid'); }}
                                                className="w-full py-4 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-none hover:bg-slate-250 transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
                                            >
                                                Reject Request
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'return_requested' && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'return_approved'); }}
                                                className="w-full py-4 bg-amber-500 border border-amber-500 text-white font-bold rounded-none hover:bg-amber-600 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                                            >
                                                Approve Return <MdAssignmentReturn size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'delivered'); }}
                                                className="w-full py-4 bg-slate-100 border border-slate-200 text-slate-650 font-bold rounded-none hover:bg-slate-250 transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
                                            >
                                                Reject Return
                                            </button>
                                        </>
                                    )}

                                    {['return_approved', 'refund_initiated'].includes(order.status) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'refunded'); }}
                                            className="w-full py-5 bg-emerald-600 border border-emerald-600 text-white font-bold rounded-none hover:bg-emerald-750 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                                        >
                                            Mark as Refunded <MdAttachMoney size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-none border border-slate-200 flex items-center justify-center transition-all ${isPending ? 'bg-red-50 text-red-650' : 'bg-slate-50 text-slate-500'}`}>
                                    <MdReceipt size={22} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg tracking-tight font-hero">#{orderID}</p>
                                    <p className="text-[10px] font-bold text-slate-400 capitalize font-hero">{order.customerId?.name || 'Guest User'}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider border ${isPending ? 'bg-amber-50 text-amber-750 border-amber-100 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {order.status.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-none p-4 mb-6 border border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-hero">Reason</p>
                            <p className="text-sm font-medium text-slate-600 line-clamp-2 italic">
                                "{order.cancelReason || order.returnReason || 'No reason specified'}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 font-hero">Total Amount</p>
                                <p className="text-xl font-bold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <button className={`px-5 py-2 rounded-none border text-[10px] font-bold uppercase tracking-widest transition-all ${isPending ? 'bg-red-600 border-red-600 text-white hover:bg-red-750' : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-950'}`}>
                                Review Details
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 md:p-12 space-y-8 h-screen overflow-y-auto no-scrollbar pb-32 bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fadeIn">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-hero">Returns & Cancellations</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage product returns, cancellations, and refunds efficiently.</p>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-650 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID or customer..."
                        className="w-full h-14 pl-12 pr-6 bg-white border border-slate-200 rounded-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm font-semibold text-slate-650"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-[100] bg-[#F8FAFC]/80 backdrop-blur-md py-4 -mx-2 px-2">
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-none border border-slate-200 shadow-sm gap-1">
                    {[
                        { id: 'requests', label: 'Requests', count: requests.length, icon: MdWarning },
                        { id: 'processing', label: 'Processing', count: processing.length, icon: MdRefresh },
                        { id: 'historical', label: 'History', count: historical.length, icon: MdCheckCircle }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-none text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-sm scale-102'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-none border text-[9px] ${activeTab === tab.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchSpecialOrders}
                    className="p-4 bg-white rounded-none border border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-300 transition-all shadow-sm active:scale-95 group"
                >
                    <MdRefresh size={24} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-none border border-slate-200 animate-pulse" />
                    ))
                ) : getActiveOrders().length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-none border border-dashed border-slate-200 animate-fadeIn">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center mb-6">
                            <MdAssignmentReturn size={48} className="text-slate-350" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-hero">No requests found</h3>
                        <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mt-2 font-hero">There are no pending actions in this category.</p>
                    </div>
                ) : (
                    getActiveOrders().map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            isExpanded={selectedOrderId === order._id}
                            onToggle={(id) => setSelectedOrderId(id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminRefundsManagement;
