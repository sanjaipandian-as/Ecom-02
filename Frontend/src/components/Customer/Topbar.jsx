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

    const getAuthPath = (mode) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('auth', mode);
        return `${location.pathname}?${searchParams.toString()}`;
    };

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
            '/sell': 'Sell on HA anti tarnish fashion Jewellery',
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

        return routeTitles[path] || 'HA anti tarnish fashion Jewellery';
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
            '/sell': 'Sell on HA anti tarnish fashion Jewellery',
            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };

        let pageTitle = 'HA anti tarnish fashion Jewellery';

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

        document.title = `${pageTitle} - HA anti tarnish fashion Jewellery`;
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
            className={`z-50 transition-all duration-300 sticky top-0 border-b shadow-xs py-2 text-black bg-dark-pale-green ${isScrolled ? 'shadow-xs border-black/15' : 'border-black/15'}`}
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
                            src="/HABG.png"
                            alt="HA logo"
                            className="w-10 h-10 object-cover shadow-md ring-2 ring-gold-champagne/30 rounded-full shrink-0 transition-transform duration-500 hover:rotate-12"
                        />
                        <span className="flex flex-col items-start text-left min-w-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 89" className="h-6 w-auto shrink-0 mb-0.5 animate-pulse-slow">
                                <defs>
                                    <linearGradient id="shiningGoldHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#000000" />
                                        <stop offset="25%" stopColor="#333333" />
                                        <stop offset="50%" stopColor="#000000" />
                                        <stop offset="75%" stopColor="#333333" />
                                        <stop offset="100%" stopColor="#000000" />
                                    </linearGradient>
                                </defs>
                                <path fill="#000000" d="m73.5 13.3c0-6.4 2.1-10.7 8.1-10.7v-1h-30.4v1c5.6 0 8.5 2.4 8.5 10.4v25.3h-36.7v-25.3c0-6.1 1.8-10.5 8-10.5v-0.9h-29.2v0.9c4.7 0 7.3 2.4 7.3 9.2v61.4c0 7.2-2.5 10.2-7.4 10.3v1h29.3v-0.9c-5-0.1-8-1.7-8-10.7v-30.9h36.7v30.5c0 8.2-2.7 11-8.5 11.1v0.9h42.3v-0.9c-2.5 0-4.6-1.1-4.6-3.8 0-2.3 0.6-4.6 1.5-6.7l8.9-22.4c-1.1 0-2.5 0.2-3.6 0.5l-9.8 23.3c-1.8 4.4-4.2 8.7-7.1 8.7-2.6 0-5.3-2.1-5.3-10.5v-59.3z" />
                                <path fill="#000000" d="m152.9 75.9-5.9-12.3v-0.1l-0.6-1.4c-1.7-0.5-3-1.6-3.7-2.4-1.4-1.6-4.6-1.8-4.6-1.5 0.7 0.2 3.2-0.2 4.7 1.4 1.7 1.7 3.8 2.7 6.3 2.8 1.9 0.1 5.8-0.3 8-0.3-2.4-1-5.1-6-9.5-5.8-1.4-0.1-2.5 0.2-3.3 0.4l0.6 0.1h-0.8-0.1-0.4l-0.1-1.5c2.9-1.2 7.3-3 9.1-2.1 1.8 1 4 1.7 6.7 1.8 5.3 0 7.2-2.9 10.6-3.1l0.1-0.3c-3-0.2-4.7-2.6-7.4-2.8-3.5-0.8-5-1.2-10.5 2.3l-0.4 0.3c-2.4 0.9-5.3 1.1-8.8 2.8h-0.3l0.3 0.1h0.1-0.1-0.1-0.2-0.1-0.1-0.1l0.4-0.1-0.4 0.1 0.1-0.4-0.1-0.8c7.6-2.5 8.8-7.8 10.6-12.2l1.5-2.3c-3 2.3-9 2.4-12 6.8-1.5 2-2.1 4.2-1.9 6.7-0.7 4-3.9 5.5-5.9 6.9l2.5-2.5c1-0.9 1.9-2.5 2.4-3.6-0.2-1.6 0-2.9 0.3-4.1l-21.9-47.2h-1.4l-19.8 47c-4.6 1-9.3 3.7-11.9 6.8l0.1 0.4c3.2-3 9-5.9 14.5-5.9 3.6 0 7.6 3.4 7.9 7.5-0.4 0.2-0.7 0.5-0.7 1s0.3 0.8 0.7 1l-2.4 4.2h-1.3l-2.1 2.9c1.9 3.4 6.1 7.8 6.1 7.8s3.9-4.2 6-7.8l-2-2.9h-1.2l-2.6-4.2c0.4-0.1 0.7-0.5 0.7-1s-0.3-0.8-0.6-1c0-2.5-1.8-5.8-4.5-7.8 10 0 20 6.5 20 16 0 7.2-5.8 15.4-12.6 21.8h1.3c4.4-2.5 8.9-8.5 12.8-14.8 2.5-4.7 6.6-7.1 8.6-6.6h0.1l4.6 10.9c1.9 3.7-0.6 6.5-4.4 6.5v0.9h29.8v-0.8c-4.3 0-7.6-1.4-10.7-7.6zm-45.4-16.8c-0.4 0-0.6-0.3-0.6-0.6 0-0.4 0.2-0.7 0.6-0.7s0.6 0.3 0.6 0.7c0 0.3-0.2 0.6-0.6 0.6zm16 12c0.6-1.3 1-3.3 1-5.5 0-9.2-8.5-17.6-21.6-17.6h-2.4l12.1-29.9 18.8 43.4v0.1h0.1c-2.2 2.3-6.6 7-8 9.5zm5.5-5.2 3.1-3.1 0.8 2.1c-1 0-2.4 0.2-3.9 1z" />
                            </svg>
                            <span className="hidden sm:block text-[7px] font-bold tracking-[0.32em] uppercase text-black mt-1.5">
                                anti tarnish fashion Jewellery
                            </span>
                        </span>
                    </button>

                    {/* Search Bar Input (Pill shape, premium border) */}
                    <div className="hidden lg:flex items-center relative z-20 flex-1 max-w-[28rem]" ref={desktopSearchRef}>
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-[12px] h-[12px]" />
                        <input
                            type="text"
                            placeholder="Search our collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-10 pr-4 py-2 rounded-full text-xs font-semibold focus:outline-none transition-all bg-cream-base text-black placeholder:text-slate-500 border border-black/20 focus:border-black focus:bg-white focus:ring-0 focus:shadow-xs"
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
                                                <FaSearch className="w-3 h-3 text-black" />
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
                                className={`relative px-3.5 py-2 transition-all duration-350 font-bold text-[10.5px] uppercase tracking-[0.24em] cursor-pointer ${isNavItemActive(item.path)
                                        ? 'text-black after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-black'
                                        : 'text-black/70 hover:text-black after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-black after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300'
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
                        className="lg:hidden w-9 h-9 rounded-full bg-cream-base hover:bg-black/10 flex items-center justify-center transition text-black hover:text-black/80 cursor-pointer"
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
                        className="lg:hidden w-9 h-9 rounded-full bg-cream-base hover:bg-black/10 flex items-center justify-center transition text-black hover:text-black/80 cursor-pointer"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
                    </button>

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Wishlist')}
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-black/10 items-center justify-center transition-all duration-300 text-black hover:text-black/70 hover:-translate-y-0.5 cursor-pointer"
                            title="Wishlist"
                        >
                            <BsFillBagHeartFill className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {userRole !== 'admin' && (
                        <button
                            onClick={() => navigate('/Cart')}
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-black/10 items-center justify-center transition-all duration-300 text-black hover:text-black/70 hover:-translate-y-0.5 cursor-pointer"
                            title="Cart"
                        >
                            <FaShoppingBag className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Notifications drawer trigger */}
                    <div className="hidden lg:block relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-9 h-9 rounded-full bg-transparent hover:bg-black/10 flex items-center justify-center transition-all duration-300 text-black hover:text-black/70 hover:-translate-y-0.5 relative cursor-pointer"
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
                            onClick={() => navigate(getAuthPath('login'))}
                            className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-black/10 items-center justify-center transition-all duration-300 text-black hover:text-black/70 hover:-translate-y-0.5 cursor-pointer"
                            title="Login"
                        >
                            <FaUser className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-black/10 items-center justify-center transition-all duration-300 text-black hover:text-black/70 hover:-translate-y-0.5 cursor-pointer"
                                title={userRole === 'admin' ? "Admin Dashboard" : userRole === 'seller' ? "Seller Dashboard" : "Settings"}
                            >
                                {userRole === 'admin' ? <FaCog className="w-3.5 h-3.5" /> : <FaUser className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex w-9 h-9 rounded-full bg-transparent hover:bg-luxury-crimson/10 items-center justify-center transition-all duration-300 text-black hover:text-luxury-crimson hover:-translate-y-0.5 cursor-pointer"
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
                <div className="lg:hidden px-4 sm:px-6 pb-2.5 pt-2 bg-dark-pale-green" ref={mobileSearchRef}>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-[12px] h-[12px] z-10" />
                        <input
                            type="text"
                            placeholder="Search jewellery..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-10 pr-4 py-2 rounded-full text-xs font-semibold focus:outline-none transition-all bg-cream-base text-black placeholder:text-slate-500 border border-black/20 focus:border-black focus:ring-0"
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
                    className="lg:hidden border-t border-gold-champagne/25 shadow-md py-4 bg-dark-pale-green"
                >
                    <div className="px-4 sm:px-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleNavigation('/')}
                                className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                            >
                                <FaHome className="w-3.5 h-3.5 text-black" />
                                <span>Home</span>
                            </button>
                            {userRole !== 'admin' && (
                                <button
                                    onClick={() => handleNavigation('/Cart')}
                                    className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaShoppingBag className="w-3.5 h-3.5 text-black" />
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
                                        className="w-full px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 uppercase tracking-[0.2em] text-left cursor-pointer"
                                    >
                                        <Icon className="w-3.5 h-3.5 text-black" />
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
                                        className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <BsFillBagHeartFill className="w-3.5 h-3.5 text-black" />
                                        <span>Wishlist</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/Cart')}
                                        className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <FaShoppingBag className="w-3.5 h-3.5 text-black" />
                                        <span>Cart</span>
                                    </button>
                                </>
                            )}
                            {isLoggedIn ? (
                                <button
                                    onClick={() => handleNavigation(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings')}
                                    className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    {userRole === 'admin' ? <FaCog className="w-3.5 h-3.5 text-black" /> : <FaUser className="w-3.5 h-3.5 text-black" />}
                                    <span>{userRole === 'admin' ? 'Dashboard' : userRole === 'seller' ? 'Seller Panel' : 'Account'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation(getAuthPath('login'))}
                                    className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaUser className="w-3.5 h-3.5 text-black" />
                                    <span>Login</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowNotifications((prev) => !prev);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-4 py-3 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left relative cursor-pointer"
                            >
                                <FaBell className="w-3.5 h-3.5 text-black" />
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
                                    onClick={() => handleNavigation(getAuthPath('login'))}
                                    className="px-4 py-2.5 text-xs font-bold border border-black/20 rounded-xl text-black hover:border-black hover:text-black/80 transition text-center uppercase tracking-wider cursor-pointer"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleNavigation(getAuthPath('register'))}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-deep border border-emerald-deep rounded-xl hover:bg-gold-lustrous hover:border-gold-lustrous transition text-center uppercase tracking-wider shadow-sm cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-cream-base border border-black/10 rounded-xl mb-2">
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
                                    className="w-full px-4 py-2.5 text-xs font-bold text-black bg-cream-base border border-black/10 rounded-xl hover:bg-black/10 hover:text-black/80 transition flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <FaCog className="w-3.5 h-3.5 text-black" />
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
