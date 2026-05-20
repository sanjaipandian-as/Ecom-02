import React, { useState, useEffect } from 'react';
import {
    MdHelpOutline,
    MdRefresh,
    MdSearch,
    MdFilterList,
    MdCheckCircle,
    MdClose,
    MdInfo,
    MdReply,
    MdPerson,
    MdPhone,
    MdEmail,
    MdHistory,
    MdWarning,
    MdArrowForward,
    MdLabel,
    MdOutlineErrorOutline,
    MdSchedule
} from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

// Move helper functions outside
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
        case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'medium': return 'bg-amber-50 text-amber-750 border-amber-250';
        case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

// Define TicketCard outside
const TicketCard = ({
    ticket,
    isExpanded,
    onToggle,
    actionLoading,
    handleSendReply,
    handleUpdateStatus,
    replyText,
    setReplyText
}) => {
    const ticketID = ticket._id.slice(-8).toUpperCase();
    const date = new Date(ticket.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div
            onClick={() => !isExpanded && onToggle(ticket._id)}
            className={`group bg-white rounded-none border transition-all duration-300 relative overflow-hidden flex flex-col ${isExpanded
                ? 'lg:col-span-2 border-slate-900 shadow-lg p-0'
                : `p-6 cursor-pointer hover:shadow-sm ${ticket.status === 'pending' ? 'border-amber-250 hover:border-amber-400 bg-amber-50/10' : 'border-slate-200'}`
                }`}
        >
            {/* Close Button */}
            {isExpanded && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(null); }}
                    className="absolute top-6 right-6 w-10 h-10 rounded-none bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-600 hover:text-white border border-slate-200 hover:border-red-600 transition-all z-50 active:scale-95"
                >
                    <MdClose size={20} />
                </button>
            )}

            {isExpanded ? (
                <div className="flex flex-col md:flex-row h-full animate-fadeIn">
                    {/* 👤 User Profile Section */}
                    <div className="md:w-1/3 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white border border-slate-200 rounded-none text-indigo-650">
                                <MdPerson size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-hero">Customer Detail</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-none border border-slate-200 shadow-sm">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-750 rounded-none flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm">
                                    {ticket.name.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 font-hero">{ticket.name}</h4>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Ticket Source</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-none group/info hover:border-indigo-300 transition-all">
                                    <MdEmail className="text-slate-400 group-hover/info:text-indigo-600" size={20} />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Email Identity</p>
                                        <p className="text-xs font-semibold text-slate-700 truncate">{ticket.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-none group/info hover:border-indigo-300 transition-all">
                                    <MdPhone className="text-slate-400 group-hover/info:text-indigo-600" size={20} />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Contact Node</p>
                                        <p className="text-xs font-semibold text-slate-700">{ticket.phone || 'No Phone Registered'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-none">
                                    <MdSchedule className="text-slate-400" size={20} />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-hero">Initiated On</p>
                                        <p className="text-xs font-semibold text-slate-700">{date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ⚖️ Ticket Content & Actions Section */}
                    <div className="md:w-2/3 p-8 flex flex-col bg-white">
                        <div className="mb-8 overflow-hidden">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="inline-block px-3 py-1 rounded-none border border-slate-200 bg-slate-55/10 text-slate-600 text-[10px] font-bold uppercase tracking-wider font-hero">
                                    Case #{ticketID}
                                </span>
                                <span className={`px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority} Priority
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 font-hero">{ticket.subject}</h2>
                            <p className="text-slate-500 text-sm font-medium">Category: <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] font-hero">{ticket.category}</span></p>
                        </div>

                        <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pr-2 mb-8">
                            {/* User Message */}
                            <div className="bg-slate-50/50 p-6 rounded-none border border-slate-200 relative">
                                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-white border border-slate-200 rounded-none text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] font-hero">Customer Message</div>
                                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    {ticket.message}
                                </p>
                            </div>

                            {/* Previous Admin Response if exists or Reply Area */}
                            {ticket.adminResponse && (
                                <div className="bg-emerald-50/30 p-6 rounded-none border border-emerald-200 relative">
                                    <div className="absolute -top-3 left-6 px-3 py-0.5 bg-white border border-emerald-200 rounded-none text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] font-hero">Previous Admin Reply</div>
                                    <p className="text-emerald-800 font-medium leading-relaxed whitespace-pre-wrap">
                                        {ticket.adminResponse}
                                    </p>
                                    <div className="mt-3 text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-hero">
                                        Responded on: {ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleString('en-IN') : 'N/A'}
                                    </div>
                                </div>
                            )}

                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2 font-hero">
                                            <MdReply className="text-indigo-600" /> New Admin Response Protocol
                                        </p>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-200 rounded-none focus:bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/10 focus:outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 resize-none"
                                            placeholder="Initialize support response sequence... (e.g. Your order is dispatched, let us know if you need anything else.)"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-200">
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                                <>
                                    <button
                                        disabled={actionLoading}
                                        onClick={(e) => { e.stopPropagation(); handleSendReply(ticket._id); }}
                                        className="col-span-1 py-4 bg-slate-900 text-white font-bold rounded-none hover:bg-indigo-650 transition-all border border-slate-900 hover:border-indigo-650 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        {actionLoading ? 'Processing...' : 'Send Logic & Resolve'} <MdCheckCircle size={18} />
                                    </button>
                                    <button
                                        disabled={actionLoading}
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket._id, 'in-progress'); }}
                                        className="col-span-1 py-4 bg-white border border-slate-200 text-slate-650 font-bold rounded-none hover:border-amber-400 hover:text-amber-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        Mark In-Progress
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket._id, 'pending'); }}
                                    className="col-span-full py-4 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-none hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px]"
                                >
                                    Re-open Ticket Case
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-none border border-slate-200 flex items-center justify-center transition-all ${ticket.status === 'pending' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                                <MdLabel size={22} />
                            </div>
                            <div className="overflow-hidden max-w-[150px]">
                                <p className="font-bold text-slate-900 text-lg tracking-tight truncate font-hero">#{ticketID}</p>
                                <p className="text-[10px] font-bold text-slate-400 capitalize truncate font-hero">{ticket.name}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-widest border transition-colors ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-none p-4 mb-6 border border-slate-200">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-2 font-hero">
                            <MdInfo size={12} className="text-slate-300" /> Intent Summary
                        </p>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 font-hero">{ticket.subject}</h4>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                            "{ticket.message}"
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-none border border-white ${ticket.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-hero">{ticket.status.replace('-', ' ')}</span>
                        </div>
                        <button className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:translate-x-1 transition-transform font-hero">
                            Inspect Case <MdArrowForward />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const AdminSupportTickets = ({ refreshId }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // pending, in-progress, resolved, closed
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchTickets();
    }, [refreshId]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await API.get('/support/admin/all');
            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status, response = '') => {
        try {
            setActionLoading(true);
            const updateData = { status };
            if (response) {
                updateData.adminResponse = response;
            }
            await API.put(`/support/admin/update/${ticketId}`, updateData);
            toast.success(`Ticket marked as ${status}`);
            await fetchTickets();
            if (status === 'resolved' || status === 'closed') {
                setSelectedTicketId(null);
                setReplyText('');
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendReply = async (ticketId) => {
        if (!replyText.trim()) {
            toast.warn('Please enter a reply message');
            return;
        }
        await handleUpdateStatus(ticketId, 'resolved', replyText);
    };

    const filteredTickets = tickets.filter(ticket => {
        const searchLower = searchTerm.toLowerCase() || '';
        return (
            (ticket._id && ticket._id.toLowerCase().includes(searchLower)) ||
            (ticket.name && ticket.name.toLowerCase().includes(searchLower)) ||
            (ticket.email && ticket.email.toLowerCase().includes(searchLower)) ||
            (ticket.subject && ticket.subject.toLowerCase().includes(searchLower))
        );
    });

    const pending = filteredTickets.filter(t => t.status === 'pending');
    const inProgress = filteredTickets.filter(t => t.status === 'in-progress');
    const resolved = filteredTickets.filter(t => t.status === 'resolved');
    const closed = filteredTickets.filter(t => t.status === 'closed');

    const getActiveTickets = () => {
        switch (activeTab) {
            case 'pending': return pending;
            case 'in-progress': return inProgress;
            case 'resolved': return resolved;
            case 'closed': return closed;
            default: return filteredTickets;
        }
    };

    return (
        <div className="p-8 md:p-12 space-y-8 h-screen overflow-y-auto no-scrollbar pb-32 bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fadeIn">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-none shadow-sm flex items-center justify-center text-indigo-650">
                        <MdHelpOutline size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-hero">Unified Ticket Intel</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage, moderate, and resolve customer support inquiries through this portal.</p>
                    </div>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search ID, Customer, or Intent..."
                        className="w-full h-14 pl-12 pr-6 bg-white border border-slate-200 rounded-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm font-semibold text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-[100] bg-[#F8FAFC]/80 backdrop-blur-md py-4 -mx-2 px-2">
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-none border border-slate-200 shadow-sm gap-1">
                    {[
                        { id: 'pending', label: 'Queued', count: pending.length, icon: MdWarning, color: 'text-amber-500' },
                        { id: 'in-progress', label: 'Processing', count: inProgress.length, icon: MdRefresh, color: 'text-blue-550' },
                        { id: 'resolved', label: 'Resolved', count: resolved.length, icon: MdCheckCircle, color: 'text-emerald-500' },
                        { id: 'closed', label: 'Historical', count: closed.length, icon: MdHistory, color: 'text-slate-400' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-none text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-sm scale-102'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : tab.color} />
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
                    onClick={fetchTickets}
                    className="p-4 bg-white rounded-none border border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-300 transition-all shadow-sm active:scale-95 group"
                >
                    <MdRefresh size={24} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-none border border-slate-200 animate-pulse" />
                    ))
                ) : getActiveTickets().length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-none border border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center mb-6">
                            <MdLabel size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight font-hero">No Case Profiles Identified</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 px-8 text-center font-hero">Protocol cleared: No assets found in the current buffer category.</p>
                    </div>
                ) : (
                    getActiveTickets().map(ticket => (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            isExpanded={selectedTicketId === ticket._id}
                            onToggle={(id) => {
                                setSelectedTicketId(id);
                                setReplyText('');
                            }}
                            actionLoading={actionLoading}
                            handleSendReply={handleSendReply}
                            handleUpdateStatus={handleUpdateStatus}
                            replyText={replyText}
                            setReplyText={setReplyText}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminSupportTickets;
