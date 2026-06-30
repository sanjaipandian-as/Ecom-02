import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Customer/Topbar';
import {
    FaUser,
    FaBell,
    FaMapMarkerAlt,
    FaBox,
    FaTicketAlt,
    FaChevronRight,
    FaArrowLeft
} from 'react-icons/fa';

// Lazy load components
const AccountSettings = lazy(() => import('./Settingscomponants/AccountSettings'));
const OrdersPage = lazy(() => import('./Orderspage'));
const AddressManagement = lazy(() => import('./Settingscomponants/AddressManagement'));
const NotificationSettings = lazy(() => import('./Settingscomponants/NotificationSettings'));
const Tickets = lazy(() => import('./Settingscomponants/Tickets'));

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const tabTitles = {
            account: 'Account Settings',
            orders: 'My Orders',
            addresses: 'My Addresses',
            tickets: 'Support Tickets',
            notifications: 'Notifications'
        };
        document.title = `${tabTitles[activeTab] || 'Settings'} - Plenora`;
    }, [activeTab]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                navigate('/Login');
                return;
            }

            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setUserData({
                    name: user.name || user.username || user.businessName || 'User',
                    email: user.email || '',
                    phone: user.phone || ''
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: FaUser, description: 'Personal details and security' },
        { id: 'orders', label: 'Orders', icon: FaBox, description: 'Track purchases and requests' },
        { id: 'addresses', label: 'Addresses', icon: FaMapMarkerAlt, description: 'Delivery locations' },
        { id: 'tickets', label: 'Support', icon: FaTicketAlt, description: 'Help desk conversations' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, description: 'Alerts and updates' }
    ];

    const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];
    const ActiveIcon = activeTabData.icon;

    const LoadingSpinner = () => (
        <div className="h-screen w-full flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
            <Topbar />

            <div className="w-full flex flex-1 flex-col lg:flex-row overflow-hidden animate-pulse">
                <aside className="w-full lg:w-[320px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 p-6 flex-shrink-0 space-y-6">
                    <div className="h-40 rounded-[2rem] bg-slate-200" />
                    <div className="h-96 rounded-2xl bg-slate-100" />
                </aside>
                <main className="flex-1 h-full bg-[#f8fafc] p-8 space-y-6">
                    <div className="h-16 rounded-2xl bg-slate-200" />
                    <div className="h-96 rounded-[2rem] bg-white border border-slate-200/50" />
                </main>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="h-screen w-full flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
            {/* Global Top Navigation Bar */}
            <Topbar />

            {/* Full Screen Main Split Layout */}
            <div className="w-full flex flex-1 flex-col lg:flex-row overflow-hidden">
                {/* Unified Sidebar / Navigation */}
                <aside className="w-full lg:w-[320px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col p-5 sm:p-6 flex-shrink-0 overflow-y-auto">
                    {/* User profile block */}
                    <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-950/10 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold uppercase text-white shadow-inner">
                                {(userData.name || 'U').charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-bold">{userData.name || 'User'}</p>
                                <p className="truncate text-sm text-slate-300">{userData.email || 'No email added yet'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation tab bar */}
                    <div className="lg:hidden">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                                            isActive
                                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Icon className="text-sm" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Navigation list */}
                    <div className="hidden lg:block space-y-4">
                        <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Workspace Navigation
                        </p>
                        <div className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 cursor-pointer ${
                                            isActive
                                                ? 'border-[#81C784]/30 bg-[#81C784]/10 shadow-sm'
                                                : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-slate-950 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-950 group-hover:text-white'
                                                }`}
                                            >
                                                <Icon className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900">{tab.label}</p>
                                                <p className="text-[11px] text-slate-500">{tab.description}</p>
                                            </div>
                                        </div>
                                        <FaChevronRight
                                            className={`text-xs transition-transform duration-300 ${
                                                isActive ? 'text-[#81C784] translate-x-1' : 'text-slate-300 group-hover:text-slate-500'
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 h-full bg-[#f8fafc] overflow-y-auto p-6 sm:p-8 lg:p-10">
                    <Suspense fallback={<LoadingSpinner />}>
                        <div className="animate-fadeIn w-full">
                            {activeTab === 'account' && (
                                <AccountSettings userData={userData} setUserData={setUserData} />
                            )}

                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md">
                                                <FaBox className="text-lg" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-950 tracking-tight">Order Registry</h3>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                    Review active, completed, and support-related order activity.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <OrdersPage />
                                </div>
                            )}

                            {activeTab === 'addresses' && <AddressManagement />}
                            {activeTab === 'tickets' && <Tickets />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                        </div>
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Settings;
