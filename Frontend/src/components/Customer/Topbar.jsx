import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Settings, 
  ShoppingCart, 
  ChevronDown,
  HelpCircle,
  Heart
} from 'lucide-react';
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
    const [categories, setCategories] = useState([]);
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(() => {
        const saved = localStorage.getItem('isTopbarExpanded');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('isTopbarExpanded', JSON.stringify(isCategoriesExpanded));
    }, [isCategoriesExpanded]);

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
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const navItems = categories.length > 0 ? categories : [
        { label: 'Viral skin glow kit', path: '/category/viral-skin-glow-kit' },
        { label: 'Viral skin whitening kit', path: '/category/viral-skin-whitening-kit' },
        { label: 'Best Sellers', path: '/category/best-sellers' },
        { label: 'Face wash', path: '/category/face-wash' },
        { label: 'Serums', path: '/category/serums' },
        { label: 'Sunscreen/ Moisture', path: '/category/sunscreen-moisture' },
        { label: 'Face pack', path: '/category/face-pack' },
        { label: 'Soaps', path: '/category/soaps' },
        { label: 'Eye care', path: '/category/eye-care' },
        { label: 'Lip care', path: '/category/lip-care' },
        { label: 'Face cream', path: '/category/face-cream' }
    ];

    const mobileLinks = [
        { label: 'Home', path: '/' },
        ...(categories.length > 0 ? categories : [
            { label: 'Viral skin glow kit', path: '/category/viral-skin-glow-kit' },
            { label: 'Viral skin whitening kit', path: '/category/viral-skin-whitening-kit' },
            { label: 'Best Sellers', path: '/category/best-sellers' },
            { label: 'Face wash', path: '/category/face-wash' },
            { label: 'Serums', path: '/category/serums' },
            { label: 'Sunscreen/ Moisture', path: '/category/sunscreen-moisture' },
            { label: 'Face pack', path: '/category/face-pack' },
            { label: 'Soaps', path: '/category/soaps' },
            { label: 'Eye care', path: '/category/eye-care' },
            { label: 'Lip care', path: '/category/lip-care' },
            { label: 'Face cream', path: '/category/face-cream' }
        ]),
        { label: 'Support', path: '/Support' },
        { label: 'My Wishlist', path: '/Wishlist' },
        { label: 'My Cart', path: '/Cart' }
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
            '/sell': 'Sell on Hey Azhagi',
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

        return routeTitles[path] || 'Hey Azhagi';
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
        const fetchCategories = async () => {
            try {
                const response = await API.get('/categories');
                if (response.data && response.data.length > 0) {
                    const mapped = response.data
                        .filter(cat => cat.isActive !== false && cat.showInTopbar === true)
                        .map(cat => {
                            const slug = cat.name.toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)+/g, '');
                            return {
                                label: cat.name,
                                path: `/category/${slug}`
                            };
                        });
                    setCategories(mapped);
                }
            } catch (error) {
                console.error('Error fetching categories for topbar:', error);
            }
        };
        fetchCategories();
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
            '/sell': 'Sell on Hey Azhagi',
            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };

        let pageTitle = 'Hey Azhagi';

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

        document.title = `${pageTitle} - Hey Azhagi`;
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
        <header
            className={`z-50 transition-all duration-300 sticky top-0 bg-white w-full ${isScrolled ? 'shadow-md' : 'border-b border-gray-100'}`}
        >
            {/* Top Row: Search, Logo, User Actions */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 sm:h-24">
                
                {/* Categories Toggle (Desktop) */}
                <button
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-all mr-4 border border-gray-100 shadow-sm active:scale-95"
                    title={isCategoriesExpanded ? "Hide Categories" : "Show Categories"}
                >
                    {isCategoriesExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    <span className="text-sm font-bold uppercase tracking-wider">Categories</span>
                </button>

                {/* Search Bar (Left) */}
                <div className="hidden lg:flex items-center relative flex-1 max-w-[300px]" ref={desktopSearchRef}>
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors w-4 h-4" />
                        <input
                            type="text"
                            placeholder='Search For "Baby care"'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(searchQuery.trim().length > 1)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-lg text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Suggestions Box */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto py-2 animate-scale-up">
                            {loadingSuggestions ? (
                                <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
                                </div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <button
                                        key={suggestion._id}
                                        onClick={() => handleSearch(suggestion.name)}
                                        className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 text-sm ${index === selectedSuggestionIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{suggestion.name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle (Left on mobile) */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-black transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Logo (Center) */}
                <div className="flex-shrink-0 flex items-center justify-center lg:flex-1">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="flex flex-col items-center group transition-transform duration-300 active:scale-95"
                    >
                        <img
                            src="/Plenora.jpeg"
                            alt="PLENORA Logo"
                            className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="mt-1 text-lg sm:text-xl font-bold tracking-[0.2em] text-gray-900 uppercase">
                            PLENORA
                        </span>
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end flex-1 gap-2 sm:gap-4 lg:gap-6">
                    
                    {/* User Account */}
                    <div className="relative group">
                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    navigate(getAuthPath('login'));
                                } else {
                                    handleNavigation(userRole === 'admin' ? '/admin-Dashboard' : userRole === 'seller' ? '/seller-home' : '/Settings');
                                }
                            }}
                            className="flex items-center gap-1.5 py-2 px-1 text-gray-700 hover:text-black transition-colors"
                        >
                            <span className="text-sm font-medium hidden md:block">
                                {isLoggedIn ? userName.split(' ')[0] : 'Hello'}
                            </span>
                            <User className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart */}
                    <button
                        onClick={() => navigate('/Cart')}
                        className="relative p-2 text-gray-700 hover:text-black transition-all hover:scale-110"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF9800] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            0
                        </span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Navigation Links (Desktop only) */}
            {isCategoriesExpanded && (
                <nav className="hidden lg:block border-t border-gray-100 bg-white animate-fade-in overflow-hidden transition-all duration-300">
                    <div className="max-w-[1400px] mx-auto px-4 flex justify-center items-stretch gap-6 xl:gap-8 h-16">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative group flex items-center">
                                {item.badge && (
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#D32F2F] text-white text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase whitespace-nowrap animate-bounce z-10">
                                        {item.badge}
                                    </span>
                                )}
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`text-[11px] font-bold uppercase tracking-[0.05em] transition-colors relative h-full flex items-center text-center px-1 leading-tight max-w-[120px] ${location.pathname === item.path ? 'text-gray-900' : 'text-gray-700 hover:text-black'}`}
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    <span className="relative py-2">
                                        {item.label}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transition-transform duration-300 ${location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </nav>
            )}

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-full max-w-[300px] bg-white shadow-2xl flex flex-col animate-slide-right">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <img src="/Plenora.jpeg" alt="Logo" className="h-10 w-auto" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                {mobileLinks.map((link) => (
                                    <button
                                        key={link.label}
                                        onClick={() => handleNavigation(link.path)}
                                        className="w-full text-left text-lg font-bold text-gray-800 hover:text-black transition-colors flex items-center justify-between"
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoggedIn ? (
                            <div className="p-6 border-t border-gray-100 space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{userName}</h4>
                                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleNavigation(getAuthPath('login'))}
                                    className="py-3 px-4 border border-gray-200 rounded-xl font-bold text-sm text-center"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleNavigation(getAuthPath('register'))}
                                    className="py-3 px-4 bg-black text-white rounded-xl font-bold text-sm text-center"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Searchbar;
