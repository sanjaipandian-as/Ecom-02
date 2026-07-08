import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaCheckCircle,
    FaShieldAlt,
    FaUserCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../../api';
import { syncLocalDataWithServer } from '../../utils/localCart';

const featurePoints = [
    'Fast checkout and order tracking',
    'Saved addresses and secure account access',
    'Personalized recommendations from your buying history'
];

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [acceptPolicy, setAcceptPolicy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const emailOrPhoneLooksValid = useMemo(() => {
        const emailRegex = /\S+@\S+\.\S+/;
        const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
        return emailRegex.test(email) || phoneRegex.test(email.replace(/\s+/g, ''));
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
            const roleNames = {
                seller: 'Seller',
                admin: 'Admin'
            };
            toast.error(`You are already logged in as ${roleNames[existingRole] || 'another user'}. Please logout and try again.`, {
                position: 'top-center',
                autoClose: 4000,
            });
            return;
        }

        if (!acceptPolicy) {
            setError('Please accept the Privacy Policy and Terms & Conditions to continue.');
            return;
        }

        setLoading(true);

        try {
            const response = await API.post('/customer/auth/login', {
                email,
                password
            });

            if (response.data.token) {
                secondaryStorage.removeItem('token');
                secondaryStorage.removeItem('user');
                secondaryStorage.removeItem('userRole');
                secondaryStorage.removeItem('loginTime');

                storage.setItem('token', response.data.token);
                storage.setItem('user', JSON.stringify(response.data.user));
                storage.setItem('userRole', 'customer');
                storage.setItem('loginTime', new Date().getTime().toString());

                // Sync guest cart & wishlist data to database
                await syncLocalDataWithServer();

                // Check if redirect query parameter exists
                const searchParams = new URLSearchParams(window.location.search);
                const redirect = searchParams.get('redirect');
                const nextUrl = redirect || '/';

                setSuccess('Login successful. Taking you to your account...');
                toast.success('Login successful!');

                setTimeout(() => {
                    window.location.href = nextUrl;
                }, 1200);
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = 'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#1f3b2d] focus:ring-4 focus:ring-[#1f3b2d]/10';

    return (
        <div className="h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#fbf7f2_0%,#ffffff_45%,#f6fbf7_100%)]">
            <div className="grid h-full w-full overflow-hidden bg-white lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative hidden h-screen overflow-hidden bg-[#1f3b2d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,199,132,0.2),transparent_28%)]" />
                    <div className="relative">

                        <h1 className="mt-8 max-w-md text-6xl font-bold leading-[1.02] tracking-tight">
                            Sign in to continue your shopping journey.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-7 text-white/78">
                            Everything important stays in one place, from your cart and order history to product recommendations tailored to what you buy most.
                        </p>
                    </div>

                    <div className="relative space-y-5">
                        {featurePoints.map((point) => (
                            <div key={point} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/14">
                                    <FaCheckCircle className="text-[#b7f3c0]" />
                                </div>
                                <p className="text-sm font-medium leading-6 text-white/88">{point}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex h-screen items-center justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
                    <div className="w-full max-w-xl">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">Welcome Back</p>
                                <h2 className="mt-2 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Customer login</h2>
                            </div>
                            <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-[#1f3b2d] sm:flex">
                                <FaUserCircle className="text-2xl" />
                            </div>
                        </div>

                        <div className="mb-8 rounded-[28px] border border-stone-200 bg-stone-50 p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1f3b2d] shadow-sm">
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-900">Secure sign-in</p>
                                    <p className="mt-1 text-sm leading-6 text-stone-500">
                                        Your session stays protected and you can choose whether to keep this device signed in.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-base font-semibold text-stone-700">Email address or Mobile number</label>
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClasses}
                                    placeholder="you@example.com or +91 98765 43210"
                                    required
                                />
                                {email && (
                                    <p className={`mt-2 text-xs font-medium ${emailOrPhoneLooksValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {emailOrPhoneLooksValid ? 'Input looks good.' : 'Please enter a valid email address or mobile number.'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="password" className="block text-base font-semibold text-stone-700">Password</label>
                                    <a href="#" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f3b2d] hover:text-[#315542]">
                                        Forgot password
                                    </a>
                                </div>
                                <div className="relative">
                                    <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${inputClasses} pl-11 pr-12`}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 rounded-[24px] border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex items-center gap-3 text-base font-medium text-stone-700">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-stone-300 text-[#1f3b2d] focus:ring-[#1f3b2d]"
                                    />
                                    Keep me signed in on this device
                                </label>
                                <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                                    {rememberMe ? 'Saved in browser' : 'Session only'}
                                </span>
                            </div>

                            <label className="flex items-start gap-3 text-base leading-6 text-stone-600">
                                <input
                                    type="checkbox"
                                    checked={acceptPolicy}
                                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-stone-300 text-[#1f3b2d] focus:ring-[#1f3b2d]"
                                    required
                                />
                                <span>
                                    I agree to the{' '}
                                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1f3b2d] underline">
                                        Privacy Policy
                                    </a>
                                    {' '}and{' '}
                                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1f3b2d] underline">
                                        Terms & Conditions
                                    </a>
                                    .
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-lg transition-all active:scale-[0.99] ${loading
                                    ? 'cursor-not-allowed bg-[#6f8f7a]'
                                    : 'bg-[#1f3b2d] hover:bg-[#315542]'
                                    }`}
                            >
                                {loading ? 'Signing in...' : 'Sign in to account'}
                                {!loading && <FaArrowRight className="text-xs" />}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-base text-stone-500">
                            New here?{' '}
                            <Link to="/Register" className="font-semibold text-[#1f3b2d] hover:text-[#315542]">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;
