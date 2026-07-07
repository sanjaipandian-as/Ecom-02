import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MdSearch, MdFilterList, MdVisibility, MdLocalShipping, MdCheckCircle, MdShoppingCart, MdReceipt, MdArrowForward, MdDownload, MdPrint } from 'react-icons/md';
import { FaTimes, FaCalendar } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../../../api';
import { printOrder } from '../../../utils/printHelper';

const StatusDropdown = ({ currentStatus, onUpdate, statuses, statusLabels, getStatusColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (status) => {
        onUpdate(status);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-[0.98] shadow-sm
                    ${getStatusColor(currentStatus)}
                `}
            >
                <span className="whitespace-nowrap">{statusLabels[currentStatus]}</span>
                <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-current opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-none shadow-md z-[50] overflow-hidden animate-slideDown origin-top-right">
                    <div className="p-1">
                        {statuses.filter(s => s !== 'all').map((status) => (
                            <div
                                key={status}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(status);
                                }}
                                className={`
                                    flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-none cursor-pointer transition-all uppercase tracking-wider mb-0.5 last:mb-0
                                    ${currentStatus === status
                                        ? 'bg-indigo-50 text-indigo-650 border-l-2 border-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                {statusLabels[status]}
                                {currentStatus === status && <MdCheckCircle className="text-sm text-indigo-600" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminOrders = ({ refreshId, triggerGlobalRefresh }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [dateFilter, setDateFilter] = useState('all');
    const [customDate, setCustomDate] = useState('');
    const [activeTab, setActiveTab] = useState('to_ship'); // 'unpaid', 'to_ship', 'in_transit', 'completed', 'all'

    const statuses = [
        'all', 
        'pending_payment', 
        'paid', 
        'packed',
        'shipped', 
        'delivered', 
        'cancellation_requested',
        'cancelled', 
        'return_requested', 
        'return_approved', 
        'return_rejected',
        'returned', 
        'refund_initiated', 
        'refunded'
    ];
    const statusLabels = {
        'all': 'All Orders',
        'pending_payment': 'Pending Payment',
        'paid': 'Processing',
        'packed': 'Packed',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancellation_requested': 'Cancel Requested',
        'cancelled': 'Cancelled',
        'return_requested': 'Return Requested',
        'return_approved': 'Return Approved',
        'return_rejected': 'Return Rejected',
        'returned': 'Returned',
        'refund_initiated': 'Refund Pending',
        'refunded': 'Refunded'
    };


    useEffect(() => {
        fetchOrders();
    }, [refreshId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/orders');
            const sortedOrders = (response.data || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await API.put(`/admin/orders/${orderId}`, { status: newStatus });
            toast.success('Order status updated successfully');
            if (triggerGlobalRefresh) triggerGlobalRefresh();
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase().replace('#', '');
        const orderIdMatch = order._id.toLowerCase().includes(term);
        const shortIdMatch = order._id.slice(-6).toLowerCase().includes(term);
        const customerMatch = order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const productMatch = order.items?.some(item =>
            item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productId?._id?.toLowerCase().includes(term)
        );

        const matchesSearch = orderIdMatch || shortIdMatch || customerMatch || productMatch;

        let matchesTab = true;
        if (activeTab === 'unpaid') matchesTab = order.status === 'pending_payment';
        else if (activeTab === 'to_ship') matchesTab = order.status === 'paid';
        else if (activeTab === 'in_transit') matchesTab = order.status === 'shipped';
        else if (activeTab === 'completed') matchesTab = order.status === 'delivered';
        else if (activeTab === 'cancelled') matchesTab = ['cancelled', 'cancellation_requested', 'refund_initiated', 'refunded'].includes(order.status);
        else if (activeTab === 'all') matchesTab = true;

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

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

        return matchesSearch && matchesStatus && matchesDate && matchesTab;
    });

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-amber-50 text-amber-600 border-amber-100',
            'paid': 'bg-indigo-50 text-indigo-650 border-indigo-150',
            'packed': 'bg-purple-50 text-purple-650 border-purple-100',
            'shipped': 'bg-blue-50 text-blue-600 border-blue-100',
            'delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'cancellation_requested': 'bg-rose-50 text-rose-650 border-rose-150',
            'cancelled': 'bg-red-50 text-red-600 border-red-100',
            'return_requested': 'bg-orange-50 text-orange-655 border-orange-100',
            'return_approved': 'bg-teal-50 text-teal-650 border-teal-150',
            'return_rejected': 'bg-slate-100 text-slate-600 border-slate-200',
            'returned': 'bg-slate-50 text-slate-600 border-slate-200',
            'refund_initiated': 'bg-teal-50 text-teal-600 border-teal-100',
            'refunded': 'bg-green-50 text-green-700 border-green-100'
        };
        return colors[status] || 'bg-slate-50 text-slate-500 border-slate-100';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_payment': return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
            case 'cancellation_requested': return <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />;
            case 'delivered': return <MdCheckCircle />;
            case 'shipped': return <MdLocalShipping />;
            case 'cancelled': return <FaTimes className="text-red-500" />;
            default: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
        }
    };

    const handleDownloadInvoice = (order) => {
        if (!order) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("HA - Invoice", 14, 22);

        // Order Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Order ID: #${order._id.slice(-6).toUpperCase()}`, 14, 32);
        doc.text(`Full Order ID: ${order._id}`, 14, 37);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 42);
        doc.text(`Status: ${order.status.replace('_', ' ')}`, 14, 47);

        // Customer Info
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Customer Details:", 14, 58);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(order.customerId?.name || 'Guest User', 14, 64);
        doc.text(order.customerId?.email || '', 14, 69);

        // Address
        const ship = order.shippingAddress;
        let addressText = "No address provided";
        if (ship) {
            if (typeof ship === 'string') {
                addressText = ship;
            } else {
                addressText = `${ship.street}, ${ship.city}\n${ship.state} - ${ship.zipCode}\n${ship.country || 'India'}\nPhone: ${ship.mobile}`;
            }
        }

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Shipping Address:", 120, 58);
        doc.setFontSize(10);
        doc.setTextColor(80);

        const splitAddress = doc.splitTextToSize(addressText, 75);
        doc.text(splitAddress, 120, 64);

        // Items Table
        const tableBody = order.items.map(item => [
            item.productId?.name || 'Unknown Item',
            item.quantity,
            `Rs. ${item.price.toLocaleString('en-IN')}`,
            `Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Item', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' }, // Indigo-600
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        doc.line(120, finalY, 196, finalY);

        doc.setFontSize(10);
        doc.text("Subtotal:", 140, finalY + 7);
        doc.text(`Rs. ${order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}`, 195, finalY + 7, { align: 'right' });

        doc.text("Shipping:", 140, finalY + 13);
        doc.text("Free", 195, finalY + 13, { align: 'right' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text("Total Amount:", 140, finalY + 24);
        doc.text(`Rs. ${order.totalAmount?.toLocaleString('en-IN')}`, 195, finalY + 24, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for shopping with HA!", 105, 285, { align: 'center' });

        doc.save(`Invoice_${order._id}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen font-body text-slate-900">
            {/* Header */}
            <div className="mb-6 md:mb-10">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-hero">Orders Management</h1>
                <p className="text-slate-550 font-medium text-xs md:text-sm mt-1">Track and manage customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="bg-white rounded-none p-4 md:p-6 border border-slate-200 shadow-sm transition-all duration-200 group cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-none bg-slate-900 text-white shadow-sm">
                            <MdShoppingCart className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-hero">Total Orders</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{orders.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-none p-4 md:p-6 border border-slate-200 shadow-sm transition-all duration-200 group cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-none bg-amber-50 border border-amber-150 text-amber-500">
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-hero">Pending</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{orders.filter(o => o.status === 'pending_payment').length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-none p-4 md:p-6 border border-slate-200 shadow-sm transition-all duration-200 group cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-none bg-indigo-50 border border-indigo-150 text-indigo-600">
                            <MdLocalShipping className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-hero">Shipped</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{orders.filter(o => o.status === 'shipped').length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-none p-4 md:p-6 border border-slate-200 shadow-sm transition-all duration-200 group cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-none bg-emerald-50 border border-emerald-150 text-emerald-500">
                            <MdCheckCircle className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-hero">Delivered</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{orders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                </div>
            </div>

            {/* Workflow Navigation */}
            <div className="mb-10 space-y-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-none border border-slate-200 shadow-sm w-fit">
                    {[
                        { id: 'to_ship', label: 'Ready to Ship', icon: <MdLocalShipping />, color: 'indigo', count: orders.filter(o => o.status === 'paid').length },
                        { id: 'unpaid', label: 'Unpaid Orders', icon: <MdReceipt />, color: 'amber', count: orders.filter(o => o.status === 'pending_payment').length },
                        { id: 'in_transit', label: 'In Transit', icon: <MdArrowForward />, color: 'blue', count: orders.filter(o => o.status === 'shipped').length },
                        { id: 'completed', label: 'Completed', icon: <MdCheckCircle />, color: 'emerald', count: orders.filter(o => o.status === 'delivered').length },
                        { id: 'cancelled', label: 'Cancelled', icon: <FaTimes />, color: 'rose', count: orders.filter(o => ['cancelled', 'cancellation_requested', 'refund_initiated', 'refunded'].includes(o.status)).length },
                        { id: 'all', label: 'View All', icon: <MdFilterList />, color: 'slate', count: orders.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                  setActiveTab(tab.id);
                                  setStatusFilter('all');
                            }}
                            className={`
                                relative flex items-center gap-3 px-6 py-3 rounded-none transition-all duration-200 overflow-hidden group
                                ${activeTab === tab.id
                                    ? `bg-slate-900 text-white scale-[1.01]`
                                    : 'text-slate-450 hover:text-slate-800 hover:bg-slate-50'}
                            `}
                        >
                            <span className="text-lg">
                                {tab.icon}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={`
                                    flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-none text-[9px] font-bold
                                    ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-650 border border-slate-200'}
                                `}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="pl-2 animate-in fade-in slide-in-from-left-4 duration-500">
                    <p className="text-[10px] font-bold text-slate-405 uppercase tracking-[0.25em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 animate-ping" />
                        {activeTab === 'to_ship' && "Logistics Queue: Processing pending physical dispatches"}
                        {activeTab === 'unpaid' && "Ledger: Orders awaiting verified digital/physical checkout"}
                        {activeTab === 'in_transit' && "Active Logistics: Dispatched packages in transit"}
                        {activeTab === 'completed' && "Settled: Handover sequence completed by courier"}
                        {activeTab === 'cancelled' && "Cancelled: Orders that were terminated or refunded"}
                        {activeTab === 'all' && "Central Directory: Comprehensive log history"}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8 animate-slideUp">
                <div className="relative flex-1 group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-none outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-slate-700 font-bold placeholder:text-slate-350 shadow-sm text-sm"
                    />
                </div>

                <div className="relative min-w-full md:min-w-[240px] custom-dropdown-container">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className={`
                            w-full flex items-center justify-between px-6 py-3.5 bg-white border rounded-none outline-none transition-all cursor-pointer shadow-sm
                            ${showFilterDropdown ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <MdFilterList className="text-indigo-600 text-xl" />
                            <span className="text-slate-700 font-bold text-sm">
                                {statusLabels[statusFilter]}
                            </span>
                        </div>
                        <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-450 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-none shadow-md z-50 overflow-hidden animate-slideDown">
                            {statuses.map((status) => (
                                <div
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`
                                        px-6 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between
                                        ${statusFilter === status ? 'bg-slate-50 text-indigo-650' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {statusLabels[status]}
                                    {statusFilter === status && <MdCheckCircle className="text-indigo-600" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Date Filters & Calendar */}
            <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm mb-8 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'all', label: 'All Time' },
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
                                className={`
                                    px-4 py-2 rounded-none text-[11px] font-bold uppercase tracking-wider transition-all border
                                    ${dateFilter === f.id
                                        ? 'bg-slate-900 text-white border-slate-900 scale-102 shadow-sm'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-350 hover:text-slate-700'
                                    }
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-none border border-slate-200/80">
                        <div className="flex items-center gap-2 px-3 text-slate-405">
                            <FaCalendar className="text-sm" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Select Date</span>
                        </div>
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => {
                                setCustomDate(e.target.value);
                                setDateFilter('custom');
                            }}
                            className="bg-white border border-slate-200 rounded-none px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                        />
                        {dateFilter === 'custom' && (
                            <button
                                onClick={() => {
                                    setDateFilter('all');
                                    setCustomDate('');
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Feed - Premium Grid Layout */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 w-full bg-white rounded-none border border-slate-200 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-none border border-dashed border-slate-200 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center mb-6 text-slate-300">
                        {activeTab === 'unpaid' ? <MdReceipt className="text-5xl" /> :
                            activeTab === 'to_ship' ? <MdLocalShipping className="text-5xl" /> :
                                <MdShoppingCart className="text-5xl" />}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {activeTab === 'to_ship' ? 'All Orders Dispatched!' :
                            activeTab === 'unpaid' ? 'No Pending Payments' :
                                'No Orders Found'}
                    </h3>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">
                        {activeTab === 'to_ship' ? "You're all caught up with shipping. Great job!" :
                            activeTab === 'unpaid' ? "All customers have completed their transactions." :
                                "Try adjusting your filters or search criteria."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredOrders.map((order, idx) => {
                        const isExpanded = selectedOrder?._id === order._id;
                        const customerInitial = order.customerId?.name?.charAt(0) || 'G';
                        const itemCount = order.items?.length || 0;

                        return (
                            <div
                                key={order._id}
                                onClick={() => setSelectedOrder(isExpanded ? null : order)}
                                className={`
                                    bg-white rounded-none p-7 border border-slate-200 shadow-sm hover:border-slate-400 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden
                                    ${isExpanded ? 'lg:col-span-2 border-indigo-400 ring-2 ring-indigo-500/10' : 'h-full'}
                                `}
                            >
                                {isExpanded && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-none blur-3xl -mr-16 -mt-16 opacity-60"></div>
                                )}

                                {order.status === 'paid' && (
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-20"></div>
                                )}
                                {order.status === 'pending_payment' && (
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 z-20"></div>
                                )}

                                {/* Card Head */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-2 h-2 rounded-none bg-indigo-500"></div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-hero">Order Details</p>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                            #{order._id.slice(-8).toUpperCase()}
                                            {order.status === 'paid' && (
                                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-bold uppercase rounded-none animate-pulse">New Order</span>
                                            )}
                                            <span className="text-[10px] font-semibold text-slate-400 font-hero">/ {new Date(order.createdAt).toLocaleDateString()}</span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusDropdown
                                            currentStatus={order.status}
                                            onUpdate={(newStatus) => updateOrderStatus(order._id, newStatus)}
                                            statuses={statuses}
                                            statusLabels={statusLabels}
                                            getStatusColor={getStatusColor}
                                        />
                                        {isExpanded && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(null);
                                                }}
                                                className="w-10 h-10 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm"
                                                title="Minimize Card"
                                            >
                                                <FaTimes className="text-sm" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Focus Section */}
                                <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-none border border-slate-200">
                                    <div className="w-12 h-12 rounded-none bg-white border border-slate-200 flex items-center justify-center text-lg font-bold text-indigo-600 transition-transform">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-405 uppercase tracking-widest leading-none mb-1 font-hero">Customer</p>
                                        <p className="text-sm font-bold text-slate-900 truncate font-hero">{order.customerId?.name || 'Guest User'}</p>
                                        <p className="text-[11px] font-medium text-slate-500 truncate">{order.customerId?.email}</p>
                                    </div>
                                </div>

                                {/* Items Info */}
                                <div className="mb-6 px-1">
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-hero">
                                        <span>Order Items ({itemCount})</span>
                                        <span className="text-slate-905 font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                    </div>

                                    {isExpanded ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-none hover:border-indigo-300 transition-colors shadow-sm">
                                                    <div className="w-12 h-12 rounded-none bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.productId?.images?.[0]}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => e.target.src = PlaceholderImage}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-900 truncate uppercase">{item.productId?.name || 'Standard Product'}</p>
                                                        <p className="text-[10px] font-medium text-slate-450">₹{item.price?.toLocaleString()} × {item.quantity}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {order.items?.slice(0, 3).map((item, i) => (
                                                <div key={i} className="w-10 h-10 rounded-none border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img
                                                        src={item.productId?.images?.[0]}
                                                        alt=""
                                                        className="w-full h-full object-cover opacity-80"
                                                        onError={(e) => e.target.src = PlaceholderImage}
                                                    />
                                                </div>
                                            ))}
                                            {itemCount > 3 && (
                                                <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    +{itemCount - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Detail Section (Conditional) */}
                                {isExpanded && (
                                    <div className="mt-4 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-hero">
                                                    <MdLocalShipping className="text-indigo-650" /> Shipping Info
                                                </h4>
                                                <div className="p-4 bg-slate-50 rounded-none border border-slate-200 text-xs font-semibold text-slate-600 leading-relaxed">
                                                    {typeof order.shippingAddress === 'string' ? (
                                                        <p>{order.shippingAddress}</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-slate-900 mb-1 font-bold">{order.shippingAddress?.fullname || order.shippingAddress?.fullName}</p>
                                                            <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                                                            <p>{order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
                                                            <p className="mt-2 text-[10px] font-bold text-indigo-600 uppercase">📞 {order.shippingAddress?.mobile}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3 font-hero">
                                                    <MdReceipt className="text-indigo-600" /> Settlement Intelligence
                                                </h4>
                                                <div className="p-6 bg-slate-50 rounded-none border border-slate-200 space-y-5 relative overflow-hidden group/settle transition-all duration-300">
                                                    <div className="flex justify-between items-center relative z-10">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channel Origin</span>
                                                        <span className="text-[10px] font-bold text-slate-900 uppercase bg-white px-3 py-1 rounded-none border border-slate-200 shadow-sm">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital / Online'}</span>
                                                    </div>
                                                    {order.razorpayPaymentId && (
                                                        <div className="flex justify-between items-center relative z-10">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gateway ID</span>
                                                            <span className="text-[10px] font-bold text-blue-600 px-2 py-1 bg-blue-50/50 rounded-none border border-blue-100 font-mono select-all truncate">{order.razorpayPaymentId}</span>
                                                        </div>
                                                    )}
                                                    {order.refundAccountDetails && (
                                                        <div className="pt-4 border-t border-slate-200 mt-4 space-y-4 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-none bg-indigo-650 animate-pulse" />
                                                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] font-hero">Refund Point (Origin: COD)</p>
                                                            </div>
                                                            {order.refundAccountDetails.accountType === 'upi' ? (
                                                                <div className="flex flex-col gap-2 bg-white p-4 rounded-none border border-slate-200 shadow-sm">
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Address (UPI)</span>
                                                                    <span className="text-[13px] font-bold text-slate-900 select-all font-mono tracking-tighter truncate">{order.refundAccountDetails.upiId}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white p-5 rounded-none border border-slate-200 space-y-4 shadow-sm transition-colors">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Beneficiary Node</span>
                                                                        <span className="text-[11px] font-bold text-slate-900 uppercase italic font-hero">{order.refundAccountDetails.beneficiaryName}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Account Archive</span>
                                                                            <span className="text-[11px] font-bold text-slate-900 select-all font-mono tracking-tight">{order.refundAccountDetails.accountNumber}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 items-end">
                                                                            <span className="text-[8px] font-bold text-slate-405 uppercase text-right">Clearing Code</span>
                                                                            <span className="text-[11px] font-bold text-slate-900 uppercase font-mono tracking-tight">{order.refundAccountDetails.ifscCode}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-end gap-3">
                                            <div className="bg-slate-900 rounded-none p-6 text-white shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-hero">Grand Total</p>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-3xl font-bold tracking-tighter font-hero">₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(order); }}
                                                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 flex items-center gap-1.5 shadow-sm border border-transparent"
                                                            title="Download PDF Invoice"
                                                        >
                                                            <MdDownload className="text-sm" /> PDF
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); printOrder(order, 'invoice'); }}
                                                            className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 flex items-center gap-1.5 shadow-sm text-white border-0 cursor-pointer"
                                                            title="Print Invoice"
                                                        >
                                                            <MdPrint className="text-sm" /> Print Invoice
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); printOrder(order, 'packing_slip'); }}
                                                            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 flex items-center gap-1.5 shadow-sm text-white border-0 cursor-pointer"
                                                            title="Print Packing Slip"
                                                        >
                                                            <MdLocalShipping className="text-sm" /> Print Slip
                                                        </button>
                                                        {order.status === 'paid' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'shipped'); }}
                                                                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 shadow-sm border-0 cursor-pointer"
                                                            >
                                                                Ship Now
                                                            </button>
                                                        )}
                                                        {order.status === 'shipped' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'delivered'); }}
                                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 shadow-sm border-0 cursor-pointer"
                                                            >
                                                                Set Delivered
                                                            </button>
                                                        )}
                                                        {order.status === 'cancellation_requested' && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'cancelled'); }}
                                                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 shadow-sm border-0 cursor-pointer"
                                                                >
                                                                    Approve Cancellation
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'paid'); }}
                                                                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all mb-1 shadow-sm border-0 cursor-pointer"
                                                                >
                                                                    Reject Request
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer Actions (Visible only when not expanded) */}
                                {!isExpanded && (
                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(order); }}
                                                className="w-9 h-9 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm cursor-pointer"
                                                title="Download Invoice PDF"
                                            >
                                                <MdDownload />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); printOrder(order, 'invoice'); }}
                                                className="w-9 h-9 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm cursor-pointer"
                                                title="Print Invoice"
                                            >
                                                <MdPrint />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); printOrder(order, 'packing_slip'); }}
                                                className="w-9 h-9 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm cursor-pointer"
                                                title="Print Packing Slip"
                                            >
                                                <MdLocalShipping />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-none text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-200 font-hero">
                                            Details <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative bg-white rounded-none shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-modalScale border border-slate-200">
                        {/* Header */}
                        <div className="p-4 md:p-8 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 md:gap-6 items-center">
                                <div className="p-3 md:p-4 bg-white rounded-none shadow-sm border border-slate-200 hidden md:block">
                                    <MdReceipt className="text-2xl md:text-3xl text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-1 font-hero">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-xs md:text-sm font-semibold text-slate-505">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Download PDF Invoice"
                                >
                                    <MdDownload className="text-base" />
                                    <span>PDF</span>
                                </button>
                                <button
                                    onClick={() => printOrder(selectedOrder, 'invoice')}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Print Invoice"
                                >
                                    <MdPrint className="text-base" />
                                    <span>Print Invoice</span>
                                </button>
                                <button
                                    onClick={() => printOrder(selectedOrder, 'packing_slip')}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-none text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Print Packing Slip"
                                >
                                    <MdLocalShipping className="text-base" />
                                    <span>Print Slip</span>
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-none transition-colors cursor-pointer ml-1"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10">
                                <div className="p-4 md:p-6 rounded-none bg-slate-50 border border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-hero"><MdVisibility className="text-indigo-650" /> Customer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-none bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                                            {selectedOrder.customerId?.name?.charAt(0) || 'G'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-900 truncate font-hero">{selectedOrder.customerId?.name || 'Guest User'}</p>
                                            <p className="text-[10px] font-medium text-slate-500 truncate">{selectedOrder.customerId?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 rounded-none bg-slate-50 border border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-hero"><MdLocalShipping className="text-indigo-655" /> Shipping</h3>
                                    {selectedOrder.shippingAddress ? (
                                        <div className="text-xs font-semibold text-slate-700 leading-relaxed">
                                            {typeof selectedOrder.shippingAddress === 'string' ? (
                                                <p>{selectedOrder.shippingAddress}</p>
                                            ) : (
                                                <>
                                                    <p className="text-slate-900 font-bold mb-0.5">{selectedOrder.shippingAddress.fullname || selectedOrder.shippingAddress.fullName}</p>
                                                    <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
                                                    <p>{selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No address provided</p>
                                    )}
                                </div>

                                <div className="p-4 md:p-6 rounded-none bg-slate-50 border border-slate-200 relative overflow-hidden group/pay">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3 font-hero"><MdReceipt className="text-indigo-600" /> Settlement Node</h3>
                                    <div className="space-y-5 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origin Channel</span>
                                            <span className="text-[10px] font-bold text-slate-900 uppercase bg-white px-3 py-1 rounded-none border border-slate-200 shadow-sm">{selectedOrder.paymentMethod === 'cod' ? 'COD Ledger' : 'Digital Gateway'}</span>
                                        </div>
                                        {selectedOrder.razorpayPaymentId && (
                                            <div className="flex flex-col gap-2 mt-4 bg-white/50 p-4 rounded-none border border-slate-200">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gateway Transaction ID</span>
                                                <span className="text-[11px] font-bold text-blue-600 font-mono select-all truncate bg-blue-50/50 p-3 border border-blue-100 shadow-inner">{selectedOrder.razorpayPaymentId}</span>
                                            </div>
                                        )}
                                        {selectedOrder.refundAccountDetails && (
                                            <div className="pt-6 border-t border-slate-200 mt-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-none bg-indigo-600 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] font-hero">Refund Endpoint (Origin: COD)</span>
                                                </div>

                                                {selectedOrder.refundAccountDetails.accountType === 'upi' ? (
                                                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">UPI Address</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-2xl font-bold text-slate-900 select-all font-mono tracking-tighter truncate leading-none">{selectedOrder.refundAccountDetails.upiId}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm space-y-6">
                                                        <div>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Beneficiary</p>
                                                            <p className="text-lg font-bold text-slate-900 uppercase italic font-hero leading-tight">{selectedOrder.refundAccountDetails.beneficiaryName}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">A/C Archive</p>
                                                                <p className="text-sm font-bold text-slate-900 select-all font-mono tracking-tight">{selectedOrder.refundAccountDetails.accountNumber}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Swift / IFSC</p>
                                                                <p className="text-sm font-bold text-slate-900 uppercase font-mono tracking-tight">{selectedOrder.refundAccountDetails.ifscCode}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-none border-slate-200 overflow-hidden mb-6 md:mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Item</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Qty</th>
                                                <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Price</th>
                                                <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {selectedOrder.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="py-4 px-6">
                                                        <p className="text-sm font-bold text-slate-900">{item.productId?.name || 'Unknown Item'}</p>
                                                        <p className="text-xs text-slate-400 font-normal">SKU: {(item.productId?._id || '').slice(-6).toUpperCase()}</p>
                                                    </td>
                                                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-700">{item.quantity}</td>
                                                    <td className="py-4 px-6 text-right text-sm font-bold text-slate-700">₹{item.price.toLocaleString('en-IN')}</td>
                                                    <td className="py-4 px-6 text-right text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full max-w-sm bg-slate-900 rounded-none p-6 text-white relative overflow-hidden">
                                    <div className="relative z-10 space-y-3">
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                            <span className="font-bold uppercase tracking-widest text-xs font-hero">Total Amount</span>
                                            <span className="text-2xl font-bold font-hero">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
