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
            '/sell': 'Sell on Anti-Tarnish Jewellery',
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

        return routeTitles[path] || 'Anti-Tarnish Jewellery';
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        const role = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        const loginTime = sessionStorage.getItem('loginTime') || localStorage.getItem('loginTime');

        if (token && user) {
            if (loginTime) {
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
                    return;
                }
            }

            setIsLoggedIn(true);
            setUserRole(role || 'customer');
            try {
                const userData = JSON.parse(user);
                setUserName(userData.name || userData.username || 'User');
                fetchNotifications();
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

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
        }, 5 * 60 * 1000);

        return () => clearInterval(checkSessionInterval);
    }, []);

    useEffect(() => {
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
            '/sell': 'Sell on Anti-Tarnish Jewellery',
            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };

        let pageTitle = 'Anti-Tarnish Jewellery';

        if (routeTitles[path]) {
            pageTitle = routeTitles[path];
        }
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

        document.title = `${pageTitle} - Anti-Tarnish Jewellery`;
    }, [location.pathname]);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                fetchSuggestions();
            }, 300);
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
            className={`z-50 transition-all duration-300 sticky top-0 border-b shadow-xs py-2 text-slate-800 ${isScrolled ? 'glass-header shadow-xs' : 'bg-white/95 border-gold-champagne/15'}`}
        >
            <div className="px-4 sm:px-6 md:px-8 xl:px-10 w-full flex items-center justify-between gap-3 min-h-[56px]">
                
                {/* Logo and Brand Title (Sharp edges) */}
                <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="flex items-center gap-3 py-1 pr-2 shrink-0 min-w-0 rounded-none cursor-pointer"
                        title="Go to home"
                    >
                        <img
                            src="/Logo.png"
                            alt="Hey Azhagi logo"
                            className="w-10 h-10 object-cover shadow-md ring-2 ring-gold-champagne/30 rounded-full shrink-0 transition-transform duration-500 hover:rotate-12"
                        />
                        <span className="flex flex-col items-start text-left min-w-0">
                            <span
                                className="text-xl sm:text-2xl font-bold tracking-[0.05em] uppercase text-emerald-deep leading-none truncate max-w-[10.5rem] sm:max-w-none"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                Hey Azhagi
                            </span>
                            <span className="hidden sm:block text-[7px] font-bold tracking-[0.32em] uppercase text-gold-lustrous mt-1.5">
                                Anti-Tarnish Jewellery
                            </span>
                        </span>
                    </button>

                    {/* Search Bar Input (Pill shape, premium border) */}
                    <div className="hidden lg:flex items-center relative z-20 flex-1 max-w-[28rem]" ref={desktopSearchRef}>
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-lustrous w-[12px] h-[12px]" />
                        <input
                            type="text"
                            placeholder="Search our collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-10 pr-4 py-2 rounded-full text-xs font-semibold focus:outline-none transition-all bg-cream-base text-slate-700 placeholder:text-slate-400 border border-gold-champagne/30 focus:border-gold-lustrous focus:bg-white focus:ring-0 focus:shadow-xs"
                        />

                        {/* Suggestions Box */}
                        {showSuggestions && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 border border-gold-champagne/20 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-md py-2"
                            >
                                {loadingSuggestions ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 mx-auto" style={{ borderBottomColor: '#b4925a' }}></div>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="py-1">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={suggestion._id}
                                                onClick={() => handleSearch(suggestion.name)}
                                                className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 text-xs text-slate-800 ${index === selectedSuggestionIndex ? 'bg-cream-dark' : 'hover:bg-cream-base'}`}
                                            >
                                                <FaSearch className="w-3 h-3 text-[#b4925a]" />
                                                <span>{suggestion.name}</span>
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

                    {/* Navigation Items */}
                    <div className="hidden lg:flex items-center gap-3 text-[15px] font-medium tracking-wide shrink-0">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item.path)}
                                className={`relative px-3.5 py-2 transition-all duration-350 font-bold text-[10.5px] uppercase tracking-[0.24em] cursor-pointer ${
                                    isNavItemActive(item.path)
                                        ? 'text-gold-lustrous after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-gold-lustrous'
                                        : 'text-slate-650 hover:text-gold-lustrous after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-gold-lustrous after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side Buttons: Cart, Wishlist, Profile */}
                <div className="flex items-center justify-end gap-1.5 shrink-0">
                    
                    {/* Mobile search toggle */}
                    <button
                        onClick={() => {
                            setShowSearchBar((prev) => !prev);
                            setIsMobileMenuOpen(false);
                        }}
                        className="lg:hidden w-9 h-9 rounded-full bg-cream-base hover:bg-gold-champagne/10 flex items-center justify-center transition text-slate-650 hover:text-gold-lustrous cursor-pointer"
                        title="Search"
                    >
                        <FaSearch className="w-3.5 h-3.5" />
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                            setShowSearchBar(false);
                            setShowNotifications(false);
                        }}
                        className="lg:hidden w-9 h-9 rounded-full bg-cream-base hover:bg-gold-champagne/10 flex items-center justify-center transition text-slate-650 hover:text-gold-lustrous cursor-pointer"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
                    </button>

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Wishlist')}
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-gold-champagne/10 items-center justify-center transition-all duration-300 text-slate-650 hover:text-gold-lustrous hover:-translate-y-0.5 cursor-pointer"
                            title="Wishlist"
                        >
                            <BsFillBagHeartFill className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Cart')}
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-gold-champagne/10 items-center justify-center transition-all duration-300 text-slate-650 hover:text-gold-lustrous hover:-translate-y-0.5 cursor-pointer"
                            title="Cart"
                        >
                            <FaShoppingBag className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Notifications drawer trigger */}
                    <div className="hidden lg:block relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-9 h-9 rounded-full bg-transparent hover:bg-gold-champagne/10 flex items-center justify-center transition-all duration-300 text-slate-650 hover:text-gold-lustrous hover:-translate-y-0.5 relative cursor-pointer"
                            title="Notifications"
                        >
                            <FaBell className="w-3.5 h-3.5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white bg-luxury-crimson animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications popup */}
                        {showNotifications && isLoggedIn && (
                            <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-auto sm:right-0 mt-2 w-auto sm:w-80 md:w-96 bg-white border border-gold-champagne/25 rounded-2xl shadow-xl z-50 max-h-[calc(100vh-5rem)] sm:max-h-[500px] overflow-hidden flex flex-col">
                                <div className="p-3 sm:p-4 border-b border-gray-100 bg-cream-soft flex-shrink-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-bold text-gold-lustrous hover:text-emerald-deep transition-colors px-2 py-0.5 hover:bg-cream-base rounded-full cursor-pointer"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="sm:hidden p-1 hover:bg-cream-base rounded-full transition-colors cursor-pointer"
                                            >
                                                <FaTimes className="w-3 h-3 text-gray-650" />
                                            </button>
                                        </div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                                        </p>
                                    )}
                                </div>

                                <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
                                    {loadingNotifications ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-lustrous mx-auto"></div>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <FaBell className="w-8 h-8 text-gray-350 mx-auto mb-2" />
                                            <p className="text-[10px] text-gray-505 font-bold uppercase tracking-wider">No notifications yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                                    className={`p-3 sm:p-4 hover:bg-cream-base/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-cream-base/10' : ''}`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="text-base flex-shrink-0 mt-0.5">
                                                            {getNotificationIcon(notification.type)}
                                                        </span>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                                <h4 className={`text-[11px] font-bold leading-tight ${!notification.isRead ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.isRead && (
                                                                    <div className="w-1.5 h-1.5 bg-gold-lustrous rounded-full flex-shrink-0 mt-1"></div>
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
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-gold-champagne/10 items-center justify-center transition-all duration-300 text-slate-650 hover:text-gold-lustrous hover:-translate-y-0.5 cursor-pointer"
                            title="Login"
                        >
                            <FaUser className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-gold-champagne/10 items-center justify-center transition-all duration-300 text-slate-650 hover:text-gold-lustrous hover:-translate-y-0.5 cursor-pointer"
                                title={userRole === 'admin' ? "Admin Dashboard" : userRole === 'seller' ? "Seller Dashboard" : "Settings"}
                            >
                                {userRole === 'admin' ? <FaCog className="w-3.5 h-3.5" /> : <FaUser className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-luxury-crimson/10 items-center justify-center transition-all duration-300 text-slate-650 hover:text-luxury-crimson hover:-translate-y-0.5 cursor-pointer"
                                title="Logout"
                            >
                                <FaSignOutAlt className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}

                </div>
            </div>
               {/* Mobile Search Bar - Visible on smaller screens */}
            {(showSearchBar || searchQuery.trim()) && (
                <div className="lg:hidden px-4 sm:px-6 pb-2.5 pt-2 bg-white" ref={mobileSearchRef}>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-lustrous w-[12px] h-[12px] z-10" />
                        <input
                            type="text"
                            placeholder="Search jewellery..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-10 pr-4 py-2 rounded-full text-xs font-semibold focus:outline-none transition-all bg-cream-base text-gray-800 placeholder-gray-405 border border-gold-champagne/30 focus:border-gold-lustrous focus:ring-0"
                        />

                        {showSuggestions && suggestions.length > 0 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-1.5 border border-gold-champagne/20 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto bg-white"
                            >
                                <div className="py-1">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion._id}
                                            onClick={() => handleSearch(suggestion.name)}
                                            className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 text-xs text-slate-800 hover:bg-cream-base"
                                        >
                                            <FaSearch className="w-3 h-3 text-gold-lustrous" />
                                            <span>{suggestion.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden border-t border-gold-champagne/25 shadow-md py-4 bg-white/95 backdrop-blur-md"
                >
                    <div className="px-4 sm:px-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleNavigation('/')}
                                className="px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                            >
                                <FaHome className="w-3.5 h-3.5 text-gold-lustrous" />
                                <span>Home</span>
                            </button>
                            {userRole !== 'admin' && (
                                <button
                                    onClick={() => handleNavigation('/Cart')}
                                    className="px-4 py-3 text-xs font-bold text-slate-755 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaShoppingBag className="w-3.5 h-3.5 text-gold-lustrous" />
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
                                        className="w-full px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 uppercase tracking-[0.2em] text-left cursor-pointer"
                                    >
                                        <Icon className="w-3.5 h-3.5 text-gold-lustrous" />
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
                                        className="px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <BsFillBagHeartFill className="w-3.5 h-3.5 text-gold-lustrous" />
                                        <span>Wishlist</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/Cart')}
                                        className="px-4 py-3 text-xs font-bold text-slate-755 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <FaShoppingBag className="w-3.5 h-3.5 text-gold-lustrous" />
                                        <span>Cart</span>
                                    </button>
                                </>
                            )}
                            {isLoggedIn ? (
                                <button
                                    onClick={() => handleNavigation(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                    className="px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    {userRole === 'admin' ? <FaCog className="w-3.5 h-3.5 text-gold-lustrous" /> : <FaUser className="w-3.5 h-3.5 text-gold-lustrous" />}
                                    <span>{userRole === 'admin' ? 'Dashboard' : userRole === 'seller' ? 'Seller Panel' : 'Account'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation('/Login')}
                                    className="px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaUser className="w-3.5 h-3.5 text-gold-lustrous" />
                                    <span>Login</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowNotifications((prev) => !prev);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-4 py-3 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left relative cursor-pointer"
                            >
                                <FaBell className="w-3.5 h-3.5 text-gold-lustrous" />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="ml-auto min-w-[18px] h-[18px] px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center bg-luxury-crimson">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="h-px bg-gray-150 my-4" />

                        {!isLoggedIn ? (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => handleNavigation('/Login')}
                                    className="px-4 py-2.5 text-xs font-bold border border-gold-champagne/20 rounded-xl text-slate-750 hover:border-gold-lustrous hover:text-gold-lustrous transition text-center uppercase tracking-wider cursor-pointer"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleNavigation('/Register')}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-deep border border-emerald-deep rounded-xl hover:bg-gold-lustrous hover:border-gold-lustrous transition text-center uppercase tracking-wider shadow-sm cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-cream-base border border-gold-champagne/10 rounded-xl mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-deep text-[#faf6e9] flex items-center justify-center font-bold">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">{userName}</h4>
                                        <p className="text-[10px] text-gray-400 capitalize">{userRole}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleNavigation('/Settings')}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-750 bg-cream-base border border-gold-champagne/10 rounded-xl hover:bg-gold-champagne/10 hover:text-gold-lustrous transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaCog className="w-3.5 h-3.5 text-gold-lustrous" />
                                    <span>Profile Settings</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-red-650 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition flex items-center gap-3 text-left cursor-pointer"
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
