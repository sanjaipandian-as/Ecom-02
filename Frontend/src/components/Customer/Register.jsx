import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaEnvelope,
    FaEye,
    FaEyeSlash,
    FaMapMarkerAlt,
    FaPhone,
    FaCheckCircle,
    FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../../api';
import { syncLocalDataWithServer } from '../../utils/localCart';

const benefits = [
    'Save addresses for faster future checkout',
    'Track orders and returns from one dashboard',
    'Unlock smarter product recommendations over time'
];

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
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

    const passwordStrength = useMemo(() => {
        const password = formData.password;
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    }, [formData.password]);

    const passwordStrengthLabel = useMemo(() => {
        if (!formData.password) return 'Add a password';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Good';
        return 'Strong';
    }, [formData.password, passwordStrength]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;
        if (name === 'phone') {
            val = val.replace(/\D/g, '').slice(0, 10);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: val
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (formData.phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Please accept the Terms & Conditions and Privacy Policy to continue.');
            return;
        }

        setLoading(true);

        try {
            const registrationData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: ''
            };

            const response = await API.post('/customer/auth/register', registrationData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userRole', 'customer');
                localStorage.setItem('loginTime', new Date().getTime().toString());

                // Sync local guest data to DB on register success
                await syncLocalDataWithServer();

                const searchParams = new URLSearchParams(window.location.search);
                const redirect = searchParams.get('redirect');
                const nextUrl = redirect || '/';

                setSuccess('Account created successfully. Redirecting...');
                toast.success('Welcome! Your account is ready.');

                setTimeout(() => {
                    window.location.href = nextUrl;
                }, 1400);
            }
        } catch (err) {
            console.error('Registration error:', err);
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = 'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#1f3b2d] focus:ring-4 focus:ring-[#1f3b2d]/10';

    return (
        <div className="h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_40%,#f5fbf7_100%)]">
            <div className="h-full w-full overflow-hidden bg-white">
                <div className="grid h-full lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden h-screen bg-[#f4efe7] p-10 lg:block">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,59,45,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,199,132,0.18),transparent_28%)]" />
                        <div className="relative">

                            <h1 className="mt-8 max-w-md text-6xl font-bold leading-[1.02] tracking-tight text-stone-950">
                                Set up your account in a few easy steps.
                            </h1>
                            <p className="mt-5 max-w-lg text-lg leading-7 text-stone-600">
                                Join with your delivery details now so the next checkout feels instant, organized, and personal.
                            </p>

                            <div className="mt-10 space-y-4">
                                {benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm">
                                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1f3b2d] text-white">
                                            <FaCheckCircle />
                                        </div>
                                        <p className="text-sm font-medium leading-6 text-stone-700">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="h-screen overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-8">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">Start here</p>
                                <h2 className="mt-2 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Create your account</h2>
                                <p className="mt-3 text-base leading-6 text-stone-500">
                                    Add your details once and we will keep your shopping flow simple from login to delivery.
                                </p>
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

                            <form onSubmit={handleSubmit} className="space-y-7">
                                <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4 sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1f3b2d] shadow-sm">
                                            <FaUser />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-stone-900">Personal information</h3>
                                            <p className="text-sm text-stone-500">Tell us who this account is for.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="firstName" className="mb-2 block text-base font-semibold text-stone-700">First name</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="John"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="mb-2 block text-base font-semibold text-stone-700">Last name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label htmlFor="email" className="mb-2 block text-base font-semibold text-stone-700">Email address</label>
                                            <div className="relative">
                                                <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-11`}
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label htmlFor="phone" className="mb-2 block text-base font-semibold text-stone-700">Phone number</label>
                                            <div className="relative">
                                                <FaPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-11`}
                                                    placeholder="9876543210"
                                                    maxLength="10"
                                                    pattern="[0-9]{10}"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4 sm:p-5">
                                    <h3 className="mb-4 text-base font-semibold text-stone-900">Security</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="password" className="mb-2 block text-base font-semibold text-stone-700">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pr-12`}
                                                    placeholder="Minimum 8 characters"
                                                    minLength="8"
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

                                        <div>
                                            <label htmlFor="confirmPassword" className="mb-2 block text-base font-semibold text-stone-700">Confirm password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pr-12`}
                                                    placeholder="Re-enter password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-stone-700">Password strength</span>
                                            <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${passwordStrength >= 4 ? 'text-emerald-600' : passwordStrength >= 2 ? 'text-amber-600' : 'text-stone-400'}`}>
                                                {passwordStrengthLabel}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4].map((bar) => (
                                                <div
                                                    key={bar}
                                                    className={`h-2 rounded-full ${passwordStrength >= bar
                                                        ? passwordStrength >= 4
                                                            ? 'bg-emerald-500'
                                                            : 'bg-amber-500'
                                                        : 'bg-stone-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-[28px] border border-stone-200 bg-white p-4 sm:p-5">
                                    <label className="flex items-start gap-3 text-base leading-6 text-stone-600">
                                        <input
                                            type="checkbox"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleChange}
                                            className="mt-1 h-4 w-4 rounded border-stone-300 text-[#1f3b2d] focus:ring-[#1f3b2d]"
                                        />
                                        <span>Send me festival offers, launch alerts, and occasional product updates.</span>
                                    </label>

                                    <label className="flex items-start gap-3 text-base leading-6 text-stone-600">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-lg transition-all active:scale-[0.99] ${loading
                                        ? 'cursor-not-allowed bg-[#6f8f7a]'
                                        : 'bg-[#1f3b2d] hover:bg-[#315542]'
                                        }`}
                                >
                                    {loading ? 'Creating account...' : 'Create account'}
                                    {!loading && <FaArrowRight className="text-xs" />}
                                </button>
                            </form>

                            <p className="mt-7 text-center text-base text-stone-500">
                                Already have an account?{' '}
                                <Link to="/Login" className="font-semibold text-[#1f3b2d] hover:text-[#315542]">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Register;
