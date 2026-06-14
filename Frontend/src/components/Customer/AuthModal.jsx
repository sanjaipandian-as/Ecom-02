import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    FaTimes,
    FaArrowRight,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaCheckCircle,
    FaShieldAlt,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../../api';

export default function AuthModal() {
    const [searchParams, setSearchParams] = useSearchParams();
    const authMode = searchParams.get('auth'); // 'login' or 'register'

    const isOpen = authMode === 'login' || authMode === 'register';

    // Login State
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [acceptPolicy, setAcceptPolicy] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register State
    const [regShowPassword, setRegShowPassword] = useState(false);
    const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');
    const [regFormData, setRegFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        newsletter: true,
        agreeToTerms: false
    });

    // Reset forms when modal closes or opens
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setLoginError('');
            setLoginLoading(false);
            setRegError('');
            setRegLoading(false);
            setRegFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                newsletter: true,
                agreeToTerms: false
            });
        }
    }, [isOpen]);

    const emailOrPhoneLooksValid = useMemo(() => {
        const emailRegex = /\S+@\S+\.\S+/;
        const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
        return emailRegex.test(email) || phoneRegex.test(email.replace(/\s+/g, ''));
    }, [email]);

    const passwordStrength = useMemo(() => {
        const pass = regFormData.password;
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    }, [regFormData.password]);

    const passwordStrengthLabel = useMemo(() => {
        if (!regFormData.password) return 'Add a password';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Good';
        return 'Strong';
    }, [regFormData.password, passwordStrength]);

    const handleRegChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;
        if (name === 'phone') {
            val = val.replace(/\D/g, '').slice(0, 10);
        }
        setRegFormData((prev) => ({
            ...prev,
            [name]: val
        }));
        if (regError) setRegError('');
    };

    const closeModal = () => {
        setSearchParams(prev => {
            const nextParams = new URLSearchParams(prev);
            nextParams.delete('auth');
            return nextParams;
        });
    };

    const switchMode = (mode) => {
        setSearchParams(prev => {
            const nextParams = new URLSearchParams(prev);
            nextParams.set('auth', mode);
            return nextParams;
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        const storage = rememberMe ? localStorage : sessionStorage;
        const secondaryStorage = rememberMe ? sessionStorage : localStorage;
        const existingRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (token && (!existingRole || existingRole === 'undefined')) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('loginTime');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('loginTime');
        } else if (existingRole && existingRole !== 'customer' && existingRole !== 'undefined') {
            const roleNames = { seller: 'Seller', admin: 'Admin' };
            toast.error(`You are already logged in as ${roleNames[existingRole] || 'another user'}. Please logout and try again.`, {
                position: 'top-center',
                autoClose: 4000,
            });
            return;
        }

        if (!acceptPolicy) {
            setLoginError('Please accept the Privacy Policy and Terms & Conditions.');
            return;
        }

        setLoginLoading(true);

        try {
            const response = await API.post('/customer/auth/login', { email, password });

            if (response.data.token) {
                secondaryStorage.removeItem('token');
                secondaryStorage.removeItem('user');
                secondaryStorage.removeItem('userRole');
                secondaryStorage.removeItem('loginTime');

                storage.setItem('token', response.data.token);
                storage.setItem('user', JSON.stringify(response.data.user));
                storage.setItem('userRole', 'customer');
                storage.setItem('loginTime', new Date().getTime().toString());

                toast.success('Login successful!');
                closeModal();

                setTimeout(() => {
                    const searchParams = new URLSearchParams(window.location.search);
                    const redirect = searchParams.get('redirect');
                    searchParams.delete('auth');
                    searchParams.delete('redirect');
                    const searchStr = searchParams.toString();
                    const nextUrl = redirect || (window.location.pathname + (searchStr ? '?' + searchStr : ''));
                    window.location.href = nextUrl;
                }, 800);
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setLoginError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegError('');

        if (regFormData.password !== regFormData.confirmPassword) {
            setRegError('Passwords do not match.');
            return;
        }

        if (regFormData.password.length < 8) {
            setRegError('Password must be at least 8 characters long.');
            return;
        }

        if (regFormData.phone.length !== 10) {
            setRegError('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (!regFormData.agreeToTerms) {
            setRegError('Please accept the Terms & Conditions and Privacy Policy.');
            return;
        }

        setRegLoading(true);

        try {
            const registrationData = {
                name: `${regFormData.firstName} ${regFormData.lastName}`.trim(),
                email: regFormData.email,
                phone: regFormData.phone,
                password: regFormData.password,
                address: `${regFormData.addressLine1}${regFormData.addressLine2 ? `, ${regFormData.addressLine2}` : ''}, ${regFormData.city}, ${regFormData.state} - ${regFormData.postalCode}`.trim(),
                addressLine1: regFormData.addressLine1,
                addressLine2: regFormData.addressLine2,
                city: regFormData.city,
                state: regFormData.state,
                postalCode: regFormData.postalCode
            };

            const response = await API.post('/customer/auth/register', registrationData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userRole', 'customer');
                localStorage.setItem('loginTime', new Date().getTime().toString());

                toast.success('Welcome! Your account is ready.');
                closeModal();

                setTimeout(() => {
                    const searchParams = new URLSearchParams(window.location.search);
                    const redirect = searchParams.get('redirect');
                    searchParams.delete('auth');
                    searchParams.delete('redirect');
                    const searchStr = searchParams.toString();
                    const nextUrl = redirect || (window.location.pathname + (searchStr ? '?' + searchStr : ''));
                    window.location.href = nextUrl;
                }, 800);
            }
        } catch (err) {
            console.error('Registration error:', err);
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setRegError(message);
            toast.error(message);
        } finally {
            setRegLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop with elegant glassmorphic blur */}
            <div 
                className="absolute inset-0 bg-emerald-deep/45 backdrop-blur-md transition-opacity duration-300"
                onClick={closeModal}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[460px] bg-white/95 backdrop-blur-xl rounded-[32px] border border-gold-champagne/25 shadow-[0_24px_50px_-12px_rgba(11,20,16,0.18)] overflow-hidden animate-scale-up max-h-[92vh] flex flex-col z-10 ring-1 ring-gold-champagne/15">
                
                {/* Borderless Luxury Header */}
                <div className="flex items-start justify-between px-8 pt-8 pb-4 shrink-0">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-lustrous">
                            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </p>
                        <h2 className="text-3xl font-bold text-emerald-deep leading-tight font-serif mt-1">
                            {authMode === 'login' ? 'Sign In' : 'Register'}
                        </h2>
                    </div>
                    <button 
                        onClick={closeModal}
                        className="w-8 h-8 rounded-full bg-cream-base border border-gold-champagne/15 hover:bg-gold-light/40 flex items-center justify-center text-slate-500 hover:text-emerald-deep transition-all cursor-pointer"
                        title="Close"
                    >
                        <FaTimes className="w-3 h-3 text-gold-lustrous" />
                    </button>
                </div>

                {/* Form Container (Scrollable) */}
                <div className="px-8 pb-8 pt-2 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {authMode === 'login' ? (
                        /* LOGIN FORM */
                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            {loginError && (
                                <div className="rounded-xl border border-red-200/50 bg-red-50/70 p-3 text-xs font-semibold text-red-700">
                                    {loginError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Email Address or Mobile number</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-lustrous/50 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com or +91 98765 43210"
                                        required
                                        className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-10 pr-4 py-3 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-4 focus:ring-gold-lustrous/10"
                                    />
                                </div>
                                {email && (
                                    <p className={`mt-1.5 text-[10px] font-semibold ${emailOrPhoneLooksValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {emailOrPhoneLooksValid ? '✓ Input looks good' : '✗ Please enter a valid email or mobile number'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Password</label>
                                    <a href="#" className="text-[10px] font-bold tracking-widest text-gold-lustrous hover:text-gold-deep uppercase">
                                        Forgot?
                                    </a>
                                </div>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-lustrous/50 w-3.5 h-3.5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-10 pr-10 py-3 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-4 focus:ring-gold-lustrous/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-450 hover:text-stone-750 cursor-pointer"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1">
                                <label className="flex items-center gap-2.5 text-stone-650 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gold-champagne/30 text-gold-lustrous focus:ring-gold-lustrous cursor-pointer accent-[#b4925a]"
                                    />
                                    <span className="font-semibold text-stone-605">Keep me signed in</span>
                                </label>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gold-lustrous bg-gold-light/40 px-2 py-0.5 rounded-sm">
                                    {rememberMe ? 'Remembered' : 'Session only'}
                                </span>
                            </div>

                            <label className="flex items-start gap-2.5 text-[11px] font-medium text-stone-500 leading-relaxed cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={acceptPolicy}
                                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gold-champagne/30 text-gold-lustrous focus:ring-gold-lustrous cursor-pointer accent-[#b4925a]"
                                    required
                                />
                                <span>
                                    I agree to the{' '}
                                    <a href="/privacy-policy" target="_blank" className="font-bold text-emerald-light hover:text-gold-lustrous underline">Privacy Policy</a>
                                    {' '}and{' '}
                                    <a href="/terms-and-conditions" target="_blank" className="font-bold text-emerald-light hover:text-gold-lustrous underline">Terms & Conditions</a>
                                    .
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className={`w-full flex items-center justify-center gap-2.5 rounded-xl bg-emerald-dark text-white font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-6 hover:bg-[#2b4c3c] hover:shadow-lg transition-all duration-300 border border-gold-champagne/15 active:scale-98 cursor-pointer ${loginLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loginLoading ? 'Signing In...' : 'Sign In'}
                                {!loginLoading && <FaArrowRight className="w-3 h-3 text-gold-champagne animate-pulse" />}
                            </button>

                            <div className="pt-2 text-center text-xs text-stone-500 font-medium">
                                New here?{' '}
                                <button 
                                    type="button"
                                    onClick={() => switchMode('register')}
                                    className="font-bold text-gold-lustrous hover:text-gold-deep cursor-pointer"
                                >
                                    Create an account
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* REGISTER FORM */
                        <form onSubmit={handleRegisterSubmit} className="space-y-5">
                            {regError && (
                                <div className="rounded-xl border border-red-200/50 bg-red-50/70 p-3 text-xs font-semibold text-red-700">
                                    {regError}
                                </div>
                            )}

                            {/* Section: Personal Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-deep font-bold font-serif text-sm border-b border-gold-champagne/15 pb-1.5">
                                    <FaUser className="w-3.5 h-3.5 text-gold-lustrous" />
                                    <span className="tracking-wide">Personal Information</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">First Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={regFormData.firstName}
                                                onChange={handleRegChange}
                                                placeholder="John"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Last Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={regFormData.lastName}
                                                onChange={handleRegChange}
                                                placeholder="Doe"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Email</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={regFormData.email}
                                                onChange={handleRegChange}
                                                placeholder="john@example.com"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Phone</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={regFormData.phone}
                                                onChange={handleRegChange}
                                                placeholder="9876543210"
                                                maxLength="10"
                                                pattern="[0-9]{10}"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Delivery Address */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 text-emerald-deep font-bold font-serif text-sm border-b border-gold-champagne/15 pb-1.5">
                                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-gold-lustrous" />
                                    <span className="tracking-wide">Delivery Address</span>
                                </div>

                                <div>
                                    <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Address Line 1</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={regFormData.addressLine1}
                                            onChange={handleRegChange}
                                            placeholder="Street name, building"
                                            required
                                            className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Address Line 2 <span className="font-normal text-stone-400">(Optional)</span></label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={regFormData.addressLine2}
                                            onChange={handleRegChange}
                                            placeholder="Flat, landmark"
                                            className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">City</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="text"
                                                name="city"
                                                value={regFormData.city}
                                                onChange={handleRegChange}
                                                placeholder="City"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">State</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="text"
                                                name="state"
                                                value={regFormData.state}
                                                onChange={handleRegChange}
                                                placeholder="State"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">PIN Code</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={regFormData.postalCode}
                                                onChange={handleRegChange}
                                                placeholder="600001"
                                                pattern="[0-9]{6}"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-3 py-2 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-gold-lustrous focus:bg-white focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Security */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 text-emerald-deep font-bold font-serif text-sm border-b border-gold-champagne/15 pb-1.5">
                                    <FaLock className="w-3.5 h-3.5 text-gold-lustrous" />
                                    <span className="tracking-wide">Security</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type={regShowPassword ? 'text' : 'password'}
                                                name="password"
                                                value={regFormData.password}
                                                onChange={handleRegChange}
                                                placeholder="Min 8 chars"
                                                minLength="8"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-8 py-2 text-xs text-stone-900 outline-none focus:border-gold-lustrous focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setRegShowPassword(!regShowPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-650 cursor-pointer"
                                            >
                                                {regShowPassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mb-1">Confirm</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-lustrous/40 w-3 h-3" />
                                            <input
                                                type={regShowConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={regFormData.confirmPassword}
                                                onChange={handleRegChange}
                                                placeholder="Re-enter"
                                                required
                                                className="w-full rounded-xl border border-stone-200 bg-cream-base/20 pl-8 pr-8 py-2 text-xs text-stone-900 outline-none focus:border-gold-lustrous focus:ring-2 focus:ring-gold-lustrous/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-650 cursor-pointer"
                                            >
                                                {regShowConfirmPassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {regFormData.password && (
                                    <div className="bg-gold-light/20 rounded-xl border border-gold-champagne/20 p-2.5">
                                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-stone-700">
                                            <span>Password strength</span>
                                            <span className={`font-bold ${passwordStrength >= 4 ? 'text-emerald-700' : passwordStrength >= 2 ? 'text-amber-700' : 'text-stone-450'}`}>
                                                {passwordStrengthLabel}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[1, 2, 3, 4].map((bar) => (
                                                <div
                                                    key={bar}
                                                    className={`h-1.5 rounded-full ${passwordStrength >= bar ? (passwordStrength >= 4 ? 'bg-emerald-600' : 'bg-amber-500') : 'bg-stone-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Agreements */}
                            <div className="space-y-2.5 pt-2.5 border-t border-gold-champagne/10 mt-4">
                                <label className="flex items-start gap-2.5 text-[11px] font-medium text-stone-500 leading-relaxed cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={regFormData.newsletter}
                                        onChange={handleRegChange}
                                        className="mt-0.5 h-4 w-4 rounded border-gold-champagne/30 text-gold-lustrous focus:ring-gold-lustrous cursor-pointer accent-[#b4925a]"
                                    />
                                    <span>Send me festival offers, launch alerts, and product updates.</span>
                                </label>

                                <label className="flex items-start gap-2.5 text-[11px] font-medium text-stone-500 leading-relaxed cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="agreeToTerms"
                                        checked={regFormData.agreeToTerms}
                                        onChange={handleRegChange}
                                        className="mt-0.5 h-4 w-4 rounded border-gold-champagne/30 text-gold-lustrous focus:ring-gold-lustrous cursor-pointer accent-[#b4925a]"
                                        required
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <a href="/privacy-policy" target="_blank" className="font-bold text-emerald-light hover:text-gold-lustrous underline">Privacy Policy</a>
                                        {' '}and{' '}
                                        <a href="/terms-and-conditions" target="_blank" className="font-bold text-emerald-light hover:text-gold-lustrous underline">Terms & Conditions</a>
                                        .
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={regLoading}
                                className={`w-full flex items-center justify-center gap-2.5 rounded-xl bg-emerald-dark text-white font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-6 hover:bg-[#2b4c3c] hover:shadow-lg transition-all duration-300 border border-gold-champagne/15 active:scale-98 cursor-pointer ${regLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {regLoading ? 'Creating Account...' : 'Create Account'}
                                {!regLoading && <FaArrowRight className="w-2.5 h-2.5" />}
                            </button>

                            <div className="text-center text-xs text-stone-500 font-medium pt-2">
                                Already have an account?{' '}
                                <button 
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="font-bold text-gold-lustrous hover:text-gold-deep cursor-pointer"
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
