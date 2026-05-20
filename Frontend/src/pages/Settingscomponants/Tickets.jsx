import { useState, useEffect } from 'react';
import {
    FaTicketAlt,
    FaClock,
    FaCheckCircle,
    FaSpinner,
    FaTimesCircle,
    FaEye,
    FaChevronDown,
    FaChevronUp,
    FaInbox,
    FaSyncAlt
} from 'react-icons/fa';
import API from '../../../api';
import Skeleton from '../../components/Common/Skeleton';

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await API.get('/support/my-tickets');
            setTickets(response.data.tickets || []);
        } catch (err) {
            console.error('Error fetching tickets:', err);

            if (err.response?.status === 401) {
                setError('Please login to view your tickets');
            } else if (err.response?.status === 404) {
                setError('Support tickets endpoint not found. Please contact support.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load tickets. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: 'Pending',
                icon: FaClock,
                bgClass: 'bg-amber-50',
                textClass: 'text-amber-700',
                borderClass: 'border-amber-200',
                chipClass: 'bg-amber-100 text-amber-700',
                description: 'Your ticket has been received and is waiting for review.'
            },
            'in-progress': {
                label: 'In Progress',
                icon: FaSpinner,
                bgClass: 'bg-[#81C784]/10',
                textClass: 'text-[#2d6a31]',
                borderClass: 'border-[#81C784]/30',
                chipClass: 'bg-[#81C784]/15 text-[#2d6a31]',
                description: 'Our support team is actively working on your request.'
            },
            resolved: {
                label: 'Resolved',
                icon: FaCheckCircle,
                bgClass: 'bg-emerald-50',
                textClass: 'text-emerald-700',
                borderClass: 'border-emerald-200',
                chipClass: 'bg-emerald-100 text-emerald-700',
                description: 'This issue has been resolved by the support team.'
            },
            closed: {
                label: 'Closed',
                icon: FaTimesCircle,
                bgClass: 'bg-slate-100',
                textClass: 'text-slate-700',
                borderClass: 'border-slate-200',
                chipClass: 'bg-slate-200 text-slate-700',
                description: 'This support conversation is closed.'
            }
        };
        return configs[status] || configs.pending;
    };

    const getCategoryLabel = (category) => {
        const labels = {
            general: 'General Inquiry',
            order: 'Order Issue',
            product: 'Product Question',
            payment: 'Payment Problem',
            delivery: 'Delivery Issue',
            return: 'Return or Refund',
            technical: 'Technical Support',
            other: 'Other'
        };
        return labels[category] || category;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        if (diffInHours < 48) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredTickets = filter === 'all' ? tickets : tickets.filter((ticket) => ticket.status === filter);

    const toggleTicketExpansion = (ticketId) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    const filterTabs = [
        { value: 'all', label: 'All Tickets', count: tickets.length },
        { value: 'pending', label: 'Pending', count: tickets.filter((ticket) => ticket.status === 'pending').length },
        { value: 'in-progress', label: 'In Progress', count: tickets.filter((ticket) => ticket.status === 'in-progress').length },
        { value: 'resolved', label: 'Resolved', count: tickets.filter((ticket) => ticket.status === 'resolved').length },
        { value: 'closed', label: 'Closed', count: tickets.filter((ticket) => ticket.status === 'closed').length }
    ];

    if (loading) {
        return (
            <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                    <Skeleton className="h-8 w-28 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-44" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-2xl" />
                        </div>
                        <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#1f2937_55%,_#81C784_190%)] p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                <FaTicketAlt className="text-[11px]" />
                                Support Desk
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">Support tickets</h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">
                                Track every support conversation, response, and issue resolution from one place.
                            </p>
                        </div>
                        <button
                            onClick={fetchTickets}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                        >
                            <FaSyncAlt className="text-xs" />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {filterTabs.slice(1, 4).map((item) => (
                        <div key={item.value} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                            <p className="mt-3 text-2xl font-bold text-slate-950">{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                        <button
                            onClick={fetchTickets}
                            className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                            filter === tab.value
                                ? 'bg-slate-950 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {filteredTickets.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                        <FaInbox className="text-2xl" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">
                        {filter === 'all' ? 'No support tickets yet' : `No ${filter} tickets`}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {filter === 'all'
                            ? 'You have not created any support tickets yet.'
                            : `There are no ${filter} tickets in your account right now.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => {
                        const statusConfig = getStatusConfig(ticket.status);
                        const StatusIcon = statusConfig.icon;
                        const isExpanded = expandedTicket === ticket._id;

                        return (
                            <div
                                key={ticket._id}
                                className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition-all ${statusConfig.borderClass}`}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${statusConfig.chipClass}`}
                                                >
                                                    <StatusIcon className={ticket.status === 'in-progress' ? 'animate-spin' : ''} />
                                                    {statusConfig.label}
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                                                    {getCategoryLabel(ticket.category)}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-950">{ticket.subject}</h3>

                                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                <span>{formatDate(ticket.createdAt)}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">
                                                    #{ticket._id.slice(-8)}
                                                </span>
                                            </div>

                                            <div className={`mt-5 rounded-[1.25rem] px-4 py-3 ${statusConfig.bgClass}`}>
                                                <p className={`text-sm font-medium ${statusConfig.textClass}`}>{statusConfig.description}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleTicketExpansion(ticket._id)}
                                            className="inline-flex h-11 w-11 items-center justify-center self-start rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                        >
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-slate-200 bg-slate-50 px-6 py-6">
                                        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                                            <div className="space-y-6">
                                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                                                    <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-950">
                                                        <FaEye className="text-[#2d6a31]" />
                                                        Your Message
                                                    </h4>
                                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{ticket.message}</p>
                                                </div>

                                                {ticket.adminResponse && (
                                                    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                                                        <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-950">
                                                            <FaCheckCircle className="text-emerald-600" />
                                                            Support Team Response
                                                        </h4>
                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.adminResponse}</p>
                                                        {ticket.respondedAt && (
                                                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                                                Responded {formatDate(ticket.respondedAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                                                    <h4 className="mb-3 text-base font-bold text-slate-950">Contact Information</h4>
                                                    <div className="space-y-3 text-sm text-slate-600">
                                                        <p><span className="font-semibold text-slate-900">Name:</span> {ticket.name}</p>
                                                        <p><span className="font-semibold text-slate-900">Email:</span> {ticket.email}</p>
                                                        {ticket.phone && (
                                                            <p><span className="font-semibold text-slate-900">Phone:</span> {ticket.phone}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                                                    <h4 className="mb-3 text-base font-bold text-slate-950">Timeline</h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                                                <FaTicketAlt />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Ticket Created</p>
                                                                <p className="text-sm text-slate-500">
                                                                    {new Date(ticket.createdAt).toLocaleString('en-IN')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {ticket.respondedAt && (
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                                                                    <FaCheckCircle />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">Response Received</p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {new Date(ticket.respondedAt).toLocaleString('en-IN')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {tickets.length > 0 && (
                <div className="rounded-[1.5rem] border border-[#81C784]/30 bg-[#81C784]/10 p-4">
                    <p className="text-sm text-[#2d6a31]">
                        <strong>Support note:</strong> most responses are handled within 24 hours, and you can continue the conversation from the Support page whenever needed.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Tickets;
