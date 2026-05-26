import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../../../../api';

const Adminlogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gatekeeperPassed, setGatekeeperPassed] = useState(false);
    const [secretPortalKey, setSecretPortalKey] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const GATEKEEPER_KEY = '9#Tq!RzA4$K@xP8mL^C2&fW7EJH';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleGatekeeperSubmit = (e) => {
        e.preventDefault();
        if (secretPortalKey === GATEKEEPER_KEY) {
            setGatekeeperPassed(true);
            setError('');
            toast.success('Access Granted');
        } else {
            setError('Invalid Secret Key');
            toast.error('Access Denied');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const existingRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        if (existingRole && existingRole !== 'admin') {
            toast.error(`Logged in as ${existingRole}. Please logout first.`);
            return;
        }

        setLoading(true);

        try {
            const response = await API.post('/admin/auth/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.admin));
                localStorage.setItem('userRole', 'admin');
                const loginTime = new Date().getTime();
                localStorage.setItem('loginTime', loginTime.toString());

                toast.success('Welcome back, Admin.');
                navigate('/admin-dashboard');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.response?.data?.message || 'Authentication failed.');
            toast.error('Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!gatekeeperPassed) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 md:p-6 font-body relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 blur-sm"></div>

                <div className="w-full max-w-sm relative z-10 animate-slideUp">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-none flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-950/50 transition-transform duration-300">
                            <MdLock className="text-3xl text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight font-hero mb-2">Restricted Access</h2>
                        <p className="text-slate-400 font-medium text-xs">Authorized personnel only.</p>
                    </div>

                    <form onSubmit={handleGatekeeperSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="password"
                                value={secretPortalKey}
                                onChange={(e) => setSecretPortalKey(e.target.value)}
                                placeholder="Enter Security Key"
                                className="w-full px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-none focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-white text-center font-bold tracking-widest placeholder:text-slate-600 transition-all duration-300 backdrop-blur-md text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4.5 bg-white text-slate-900 font-bold rounded-none hover:bg-indigo-600 hover:text-white transition-all shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <span>Verify Identity</span>
                            <MdArrowForward className="text-lg" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-body">
            <div className="w-full max-w-[400px] animate-slideUp">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 transition-transform duration-500">
                        <span className="text-white font-bold text-2xl font-hero">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-hero mb-2">HA Admin</h1>
                    <p className="text-slate-500 font-medium text-xs">Sign in to manage your storefront.</p>
                </div>

                {/* Card */}
                <div className="bg-white p-6 md:p-8 rounded-none shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-none text-red-600 text-xs font-bold text-center animate-fadeIn">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="relative group">
                                    <MdPerson className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-lg" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all font-semibold text-slate-900 placeholder:text-slate-350"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <MdLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-lg" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all font-semibold text-slate-900 placeholder:text-slate-350"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 border border-slate-300 rounded-none peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                                    <svg className="absolute top-[2px] left-[2px] w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-750 hover:underline">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-none hover:bg-indigo-600 transition-all shadow-md active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Sign In to Dashboard</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[11px] font-bold text-slate-450 uppercase tracking-widest hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate('/')}>
                    ← Return to Store
                </p>
            </div>
        </div>
    );
};

export default Adminlogin;
