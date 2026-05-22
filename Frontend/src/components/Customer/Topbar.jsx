import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaShoppingBag, FaCog } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../../api';

const Searchbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceTimer = useRef(null);
    const notificationRef = useRef(null);

    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        if (!isHomePage) {
            setIsScrolled(true);
            return;
        }

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const navItems = [
        { label: 'Shop', path: '/products', icon: FaShoppingBag },
        { label: 'Bestsellers', path: '/category/bestsellers', icon: FaShoppingBag },
        { label: 'Support', path: '/Support', icon: FaUser },
        { label: 'About', path: '/about', icon: FaHome }
    ];

    const isNavItemActive = (path) => {
        if (path === '/products') {
            return location.pathname === '/products' || location.pathname.startsWith('/product/') || location.pathname.startsWith('/search');
        }
        return location.pathname === path;
    };


    const getPageTitle = () => {
        const path = location.pathname;
        const routeTitles = {

            '/': 'Home',
            '/products': 'Products',
            '/search': 'Search Results',


            '/Cart': 'Shopping Cart',
            '/Wishlist': 'My Wishlist',
            '/checkout': 'Checkout',
            '/Payment': 'Payment',


            '/Login': 'Customer Login',
            '/Register': 'Customer Sign Up',


            '/seller-login': 'Seller Login',
            '/seller-register': 'Seller Registration',
            '/seller-home': 'Seller Dashboard',


            '/admin-login': 'Admin Login',
            '/admin-Dashboard': 'Admin Dashboard',


            '/Settings': 'Account Settings',
            '/Settings/profile': 'My Profile',
            '/Settings/orders': 'My Orders',
            '/Settings/address': 'My Addresses',
            '/Settings/notifications': 'Notifications',
            '/Settings/security': 'Security Settings',
            '/Settings/payment-methods': 'Payment Methods',


            '/about': 'About Us',
            '/contact': 'Contact Us',


            '/Support': 'Customer Support',
            '/shipping': 'Shipping & Delivery',
            '/returns': 'Returns & Refunds',
            '/track-order': 'Track Your Order',
            '/faqs': 'Frequently Asked Questions',


            '/privacy-policy': 'Privacy Policy',
            '/terms-and-conditions': 'Terms & Conditions',


            '/Affiliate': 'Affiliate Program',
            '/BrandRegistry': 'Brand Registry',
            '/advertise': 'Advertise Your Products',
            '/sell': 'Sell on Anti Turnish Jewellery',


            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };


        if (path.startsWith('/product/')) return 'Product Details';
        if (path.startsWith('/category/')) {
            const category = path.split('/')[2];
            return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';
        }
        if (path.startsWith('/seller/')) return 'Seller Dashboard';
        if (path.startsWith('/admin/')) return 'Admin Panel';
        if (path.startsWith('/order/')) return 'Order Details';
        if (path.startsWith('/Settings/')) {
            const settingsPage = path.split('/')[2];
            const settingsTitles = {
                'profile': 'My Profile',
                'orders': 'My Orders',
                'address': 'My Addresses',
                'notifications': 'Notifications',
                'security': 'Security Settings',
                'payment-methods': 'Payment Methods',
            };
            return settingsTitles[settingsPage] || 'Settings';
        }

        return routeTitles[path] || 'Anti Turnish Jewellery';
    };

    useEffect(() => {
        // Check if user is logged in (check both localStorage and sessionStorage)
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        const role = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        const loginTime = sessionStorage.getItem('loginTime') || localStorage.getItem('loginTime');

        if (token && user) {
            // Check if 24 hours have passed since login
            if (loginTime) {
                const currentTime = new Date().getTime();
                const loginTimestamp = parseInt(loginTime);
                const hoursPassed = (currentTime - loginTimestamp) / (1000 * 60 * 60);

                // If more than 24 hours have passed, automatically logout
                if (hoursPassed >= 24) {
                    console.log('Session expired after 24 hours. Logging out...');
                    handleLogout();
                    toast.info('Your session has expired. Please login again.', {
                        position: "top-center",
                        autoClose: 5000,
                    });
                    return;
                }
            }

            setIsLoggedIn(true);
            setUserRole(role || 'customer');
            try {
                const userData = JSON.parse(user);
                setUserName(userData.name || userData.username || 'User');
                // Fetch notifications for logged-in users
                fetchNotifications();
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Set up interval to check session expiry every 5 minutes
        const checkSessionInterval = setInterval(() => {
            const loginTime = sessionStorage.getItem('loginTime') || localStorage.getItem('loginTime');
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            if (token && loginTime) {
                const currentTime = new Date().getTime();
                const loginTimestamp = parseInt(loginTime);
                const hoursPassed = (currentTime - loginTimestamp) / (1000 * 60 * 60);

                if (hoursPassed >= 24) {
                    console.log('Session expired after 24 hours. Logging out...');
                    handleLogout();
                    toast.info('Your session has expired. Please login again.', {
                        position: "top-center",
                        autoClose: 5000,
                    });
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        // Cleanup interval on component unmount
        return () => clearInterval(checkSessionInterval);
    }, []);

    // Update document title based on current route
    useEffect(() => {
        const path = location.pathname;
        const routeTitles = {
            // Main Pages
            '/': 'Home',
            '/products': 'Products',
            '/search': 'Search Results',

            // Cart & Wishlist
            '/Cart': 'Shopping Cart',
            '/Wishlist': 'My Wishlist',
            '/checkout': 'Checkout',
            '/Payment': 'Payment',

            // Customer Auth
            '/Login': 'Customer Login',
            '/Register': 'Customer Sign Up',

            // Seller Auth & Dashboard
            '/seller-login': 'Seller Login',
            '/seller-register': 'Seller Registration',
            '/seller-home': 'Seller Dashboard',

            // Admin
            '/admin-login': 'Admin Login',
            '/admin-Dashboard': 'Admin Dashboard',

            // Settings & Profile
            '/Settings': 'Account Settings',
            '/Settings/profile': 'My Profile',
            '/Settings/orders': 'My Orders',
            '/Settings/address': 'My Addresses',
            '/Settings/notifications': 'Notifications',
            '/Settings/security': 'Security Settings',
            '/Settings/payment-methods': 'Payment Methods',

            // Company Pages
            '/about': 'About Us',
            '/contact': 'Contact Us',

            // Support & Help
            '/Support': 'Customer Support',
            '/shipping': 'Shipping & Delivery',
            '/returns': 'Returns & Refunds',
            '/track-order': 'Track Your Order',
            '/faqs': 'Frequently Asked Questions',

            // Legal & Policies
            '/privacy-policy': 'Privacy Policy',
            '/terms-and-conditions': 'Terms & Conditions',

            // Business & Partnerships
            '/Affiliate': 'Affiliate Program',
            '/BrandRegistry': 'Brand Registry',
            '/advertise': 'Advertise Your Products',
            '/sell': 'Sell on Anti Turnish Jewellery',

            // Footer Links
            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };

        let pageTitle = 'Anti Turnish Jewellery';

        // Check for exact route match first
        if (routeTitles[path]) {
            pageTitle = routeTitles[path];
        }
        // Check for dynamic routes
        else if (path.startsWith('/product/')) {
            pageTitle = 'Product Details';
        }
        else if (path.startsWith('/category/')) {
            const category = path.split('/')[2];
            pageTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';
        }
        else if (path.startsWith('/seller/')) {
            pageTitle = 'Seller Dashboard';
        }
        else if (path.startsWith('/admin/')) {
            pageTitle = 'Admin Panel';
        }
        else if (path.startsWith('/order/')) {
            pageTitle = 'Order Details';
        }
        else if (path.startsWith('/Settings/')) {
            const settingsPage = path.split('/')[2];
            const settingsTitles = {
                'profile': 'My Profile',
                'orders': 'My Orders',
                'address': 'My Addresses',
                'notifications': 'Notifications',
                'security': 'Security Settings',
                'payment-methods': 'Payment Methods',
            };
            pageTitle = settingsTitles[settingsPage] || 'Settings';
        }

        document.title = `${pageTitle} - Anti Turnish Jewellery`;
    }, [location.pathname]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedDesktopSearch = desktopSearchRef.current?.contains(event.target);
            const clickedMobileSearch = mobileSearchRef.current?.contains(event.target);

            if (!clickedDesktopSearch && !clickedMobileSearch) {
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowSearchBar(false);
        setShowSuggestions(false);
        setShowNotifications(false);
        setSelectedSuggestionIndex(-1);
    }, [location.pathname]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            // Clear previous timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Set new timer
            debounceTimer.current = setTimeout(() => {
                fetchSuggestions();
            }, 300); // 300ms debounce
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    const fetchSuggestions = async () => {
        try {
            setLoadingSuggestions(true);
            const response = await API.get(`/search/suggest?q=${encodeURIComponent(searchQuery)}`);
            setSuggestions(Array.isArray(response.data) ? response.data : []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSearch = (query = searchQuery) => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
            setSearchQuery(query.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                handleSearch(suggestions[selectedSuggestionIndex].name);
            } else {
                handleSearch();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    // Notification Functions
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            setLoadingNotifications(true);
            const response = await API.get('/notifications');
            const notifs = response.data.notifications || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await API.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return '📦';
            case 'payment': return '💳';
            case 'product': return '🎆';
            case 'kyc': return '✅';
            case 'payout': return '💰';
            default: return '🔔';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleLogout = () => {
        // Clear authentication data from both storages
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('loginTime');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginTime');

        setIsLoggedIn(false);
        setUserName('');
        setUserRole('');
        // Redirect to home page
        navigate('/');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setShowSearchBar(false);
        setShowSuggestions(false);
        setShowNotifications(false);
    };

    return (
        <div
            className={`z-50 transition-all duration-300 ${isHomePage
                    ? "fixed top-0 left-0 right-0 text-gray-800 border-b border-white/30 shadow-[0_18px_48px_rgba(15,23,42,0.08)] py-3"
                    : "sticky top-0 border-b border-white/30 shadow-[0_18px_48px_rgba(15,23,42,0.08)] text-gray-800 py-3"
                }`}
            style={{
                background: 'linear-gradient(90deg, rgba(244,248,244,0.88) 0%, rgba(255,255,255,0.84) 52%, rgba(255,245,244,0.84) 100%)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)'
            }}
        >
            <div className="px-4 sm:px-6 md:px-8 xl:px-10 w-full flex items-center justify-between gap-3 min-h-[64px]">
                <div className="flex items-center gap-3 lg:gap-5 flex-1 min-w-0">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="flex items-center gap-3 rounded-2xl py-1.5 pr-2 shrink-0 min-w-0"
                        title="Go to home"
                    >
                        <img
                            src="/Logo.png"
                            alt="Hey Azhagi logo"
                            className="w-11 h-11 rounded-[1.35rem] object-cover shadow-[0_10px_25px_rgba(129,199,132,0.35)] ring-1 ring-white/70 shrink-0"
                        />
                        <span className="flex flex-col items-start text-left min-w-0">
                            <span
                                className="text-[1.65rem] font-semibold tracking-[-0.03em] text-slate-800 leading-none truncate max-w-[10.5rem] sm:max-w-none"
                                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                            >
                                Hey Azhagi
                            </span>
                            <span className="hidden sm:block text-[9px] font-bold tracking-[0.32em] uppercase text-slate-400 mt-1">
                                Anti Turnish Jewellery
                            </span>
                        </span>
                    </button>

                    <div className="hidden lg:flex items-center relative z-20 flex-1 max-w-[36rem]" ref={desktopSearchRef}>
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-[15px] h-[15px]" />
                        <input
                            type="text"
                            placeholder="Search collections, rings, earrings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-12 pr-5 py-3 rounded-full text-sm font-semibold focus:outline-none transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_20px_rgba(148,163,184,0.12)] bg-white/90 text-slate-700 placeholder:text-slate-400 border border-white/70 focus:bg-white focus:border-[#81C784]/50 focus:ring-4 focus:ring-[#81C784]/10"
                        />

                        {/* Suggestions box */}
                        {showSuggestions && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                            >
                                {loadingSuggestions ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 mx-auto" style={{ borderBottomColor: '#81C784' }}></div>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="py-2">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={suggestion._id}
                                                onClick={() => handleSearch(suggestion.name)}
                                                className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 text-xs`}
                                                style={{ backgroundColor: index === selectedSuggestionIndex ? 'rgba(200, 230, 201, 0.2)' : 'transparent' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(200, 230, 201, 0.2)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index === selectedSuggestionIndex ? 'rgba(200, 230, 201, 0.2)' : 'transparent'; }}
                                            >
                                                <FaSearch className="w-3 h-3 text-[#81C784]" />
                                                <span className="text-gray-800">{suggestion.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : searchQuery.trim().length > 1 ? (
                                    <div className="p-4 text-center text-xs text-gray-500">
                                        No suggestions found
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-[15px] font-medium tracking-wide shrink-0">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item.path)}
                                className={`px-3.5 py-2 rounded-full transition-all duration-200 font-bold text-[11px] uppercase tracking-[0.26em] ${isNavItemActive(item.path)
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-300/40'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 rounded-full bg-white/45 border border-white/60 px-2 py-1.5 shadow-[0_10px_30px_rgba(148,163,184,0.15)]">
                    <button
                        onClick={() => {
                            setShowSearchBar((prev) => !prev);
                            setIsMobileMenuOpen(false);
                        }}
                        className="lg:hidden w-9 h-9 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white flex items-center justify-center transition shadow-sm text-slate-600 hover:text-[#4FAE57]"
                        title="Search"
                    >
                        <FaSearch className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                            setShowSearchBar(false);
                            setShowNotifications(false);
                        }}
                        className="lg:hidden w-9 h-9 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white flex items-center justify-center transition shadow-sm text-slate-600 hover:text-[#4FAE57]"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
                    </button>

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Wishlist')}
                            className="hidden lg:flex w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-[#4FAE57] hover:-translate-y-0.5"
                            title="Wishlist"
                        >
                            <BsFillBagHeartFill className="w-4 h-4" />
                        </button>
                    )}

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Cart')}
                            className="hidden lg:flex w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-[#4FAE57] hover:-translate-y-0.5"
                            title="Cart"
                        >
                            <FaShoppingBag className="w-4 h-4" />
                        </button>
                    )}

                    {/* Notifications system */}
                    <div className="hidden lg:block relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-[#4FAE57] hover:-translate-y-0.5 relative"
                            title="Notifications"
                        >
                            <FaBell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white bg-amber-500 animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications drawer */}
                        {showNotifications && isLoggedIn && (
                            <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-auto sm:right-0 mt-2 w-auto sm:w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-5rem)] sm:max-h-[500px] overflow-hidden flex flex-col">
                                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs font-semibold text-[#81C784] hover:text-[#66bb6a] transition-colors px-2 py-0.5 hover:bg-green-50 rounded"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="sm:hidden p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                <FaTimes className="w-3 h-3 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-gray-500">
                                            You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                                        </p>
                                    )}
                                </div>

                                <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
                                    {loadingNotifications ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#81C784] mx-auto"></div>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <FaBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                                    className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-green-50/30' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="text-lg flex-shrink-0 mt-0.5">
                                                            {getNotificationIcon(notification.type)}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                                <h4 className={`text-xs font-bold leading-tight ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                                    }`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.isRead && (
                                                                    <div className="w-1.5 h-1.5 bg-[#81C784] rounded-full flex-shrink-0 mt-1"></div>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 line-clamp-2 mb-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400">
                                                                {getTimeAgo(notification.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Auth Status & Account Toggles */}
                    {!isLoggedIn ? (
                        <button
                            onClick={() => navigate('/Login')}
                            className="hidden lg:flex w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-[#4FAE57] hover:-translate-y-0.5"
                            title="Login"
                        >
                            <FaUser className="w-4 h-4" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                className="hidden lg:flex w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-[#4FAE57] hover:-translate-y-0.5"
                                title={userRole === 'admin' ? "Admin Dashboard" : userRole === 'seller' ? "Seller Dashboard" : "Settings"}
                            >
                                {userRole === 'admin' ? <FaCog className="w-4 h-4" /> : <FaUser className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex w-10 h-10 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white items-center justify-center transition-all duration-200 shadow-sm text-slate-600 hover:text-rose-500 hover:-translate-y-0.5"
                                title="Logout"
                            >
                                <FaSignOutAlt className="w-4 h-4" />
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* Mobile Search Bar - Visible on smaller screens */}
            {(showSearchBar || searchQuery.trim()) && (
                <div className="lg:hidden px-4 sm:px-6 pb-2.5 pt-2" ref={mobileSearchRef}>
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-[14px] h-[14px] z-10" />
                    <input
                        type="text"
                        placeholder="Search jewellery..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none transition-all shadow-sm ${isHomePage && !isScrolled
                                ? "bg-white/95 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50"
                                : "bg-gray-100 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#81C784] border border-gray-200"
                            }`}
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            className="absolute top-full left-0 right-0 mt-2 border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                        >
                            <div className="py-1">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={suggestion._id}
                                        onClick={() => handleSearch(suggestion.name)}
                                        className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 text-xs text-gray-800 hover:bg-green-50"
                                    >
                                        <FaSearch className="w-3 h-3 text-[#81C784]" />
                                        <span>{suggestion.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* Mobile Drawer menu */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden border-t border-gray-100 shadow-xl py-4 animate-slideDown animate-fadeIn"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                    <div className="px-4 sm:px-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleNavigation('/')}
                                className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                            >
                                <FaHome className="w-3.5 h-3.5" />
                                <span>Home</span>
                            </button>
                            {userRole !== 'admin' && (
                                <button
                                    onClick={() => handleNavigation('/Cart')}
                                    className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                                >
                                    <FaShoppingBag className="w-3.5 h-3.5" />
                                    <span>Cart</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => handleNavigation(item.path)}
                                        className="w-full px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 uppercase tracking-[0.2em] text-left"
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {userRole !== 'admin' && (
                                <>
                                    <button
                                        onClick={() => handleNavigation('/Wishlist')}
                                        className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                                    >
                                        <BsFillBagHeartFill className="w-3.5 h-3.5" />
                                        <span>Wishlist</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/Cart')}
                                        className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                                    >
                                        <FaShoppingBag className="w-3.5 h-3.5" />
                                        <span>Cart</span>
                                    </button>
                                </>
                            )}
                            {isLoggedIn ? (
                                <button
                                    onClick={() => handleNavigation(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                    className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                                >
                                    {userRole === 'admin' ? <FaCog className="w-3.5 h-3.5" /> : <FaUser className="w-3.5 h-3.5" />}
                                    <span>{userRole === 'admin' ? 'Dashboard' : userRole === 'seller' ? 'Seller Panel' : 'Account'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation('/Login')}
                                    className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left"
                                >
                                    <FaUser className="w-3.5 h-3.5" />
                                    <span>Login</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowNotifications((prev) => !prev);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-green-50 hover:text-green-600 transition flex items-center gap-3 text-left relative"
                            >
                                <FaBell className="w-3.5 h-3.5" />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="ml-auto min-w-[18px] h-[18px] px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center bg-amber-500">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 my-4" />

                        {!isLoggedIn ? (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        handleNavigation('/Login');
                                    }}
                                    className="px-4 py-2.5 text-xs font-bold border border-gray-300 rounded-lg text-gray-700 hover:border-green-500 hover:text-[#81C784] transition text-center uppercase tracking-wider"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        handleNavigation('/Register');
                                    }}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-[#81C784] rounded-lg hover:bg-[#66bb6a] transition text-center uppercase tracking-wider shadow-sm"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl mb-2">
                                    <div className="w-10 h-10 rounded-full bg-[#81C784] text-white flex items-center justify-center font-bold">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">{userName}</h4>
                                        <p className="text-[10px] text-gray-400 capitalize">{userRole}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        handleNavigation('/Settings');
                                    }}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 rounded-lg hover:bg-green-50 transition flex items-center gap-3 text-left"
                                >
                                    <FaCog className="w-3.5 h-3.5" />
                                    <span>Profile Settings</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-3 text-left"
                                >
                                    <FaSignOutAlt className="w-3.5 h-3.5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Searchbar;
