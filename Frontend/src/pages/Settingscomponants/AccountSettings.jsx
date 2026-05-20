import { useEffect, useState } from 'react';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaEdit,
    FaSave,
    FaKey,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaTimes,
    FaShieldAlt,
    FaCheckCircle
} from 'react-icons/fa';
import API from '../../../api';

const AccountSettings = ({ userData, setUserData }) => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedData, setEditedData] = useState({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
    });
    const [saving, setSaving] = useState(false);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        setEditedData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
        });
    }, [userData]);

    const inputClasses = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#81C784] focus:ring-4 focus:ring-[#81C784]/15';
    const labelClasses = 'mb-2 block text-sm font-semibold text-slate-700';

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

            if (userRole === 'seller') {
                await API.put('/seller/profile', {
                    businessName: editedData.name,
                    email: editedData.email,
                    phone: editedData.phone
                });
            } else {
                const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.name = editedData.name;
                    user.email = editedData.email;
                    user.phone = editedData.phone;

                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    if (sessionStorage.getItem('user')) {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                }
            }

            setUserData(editedData);
            setIsEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            setPasswordError('New password must be different from old password');
            return;
        }

        try {
            setSaving(true);
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

            if (userRole === 'customer') {
                await API.put('/customer/auth/change-password', {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                });
            } else {
                setPasswordError('Password change is only available for customers');
                setSaving(false);
                return;
            }

            alert('Password changed successfully!');
            setShowPasswordForm(false);
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError(
                error.response?.data?.message || 'Failed to change password. Please check your old password.'
            );
        } finally {
            setSaving(false);
        }
    };

    const profileItems = [
        {
            icon: FaEnvelope,
            label: 'Email',
            value: userData.email || 'Add an email address'
        },
        {
            icon: FaPhone,
            label: 'Phone',
            value: userData.phone || 'Add a phone number'
        },
        {
            icon: FaShieldAlt,
            label: 'Security',
            value: 'Password protection enabled'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#1f2937_55%,_#81C784_180%)] p-6 text-white">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                <FaUser className="text-[11px]" />
                                Account Identity
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">{userData.name || 'Customer Account'}</h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">
                                Keep your profile details accurate so orders, delivery updates, and support communication stay reliable.
                            </p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold uppercase">
                            {(userData.name || 'U').charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile Snapshot</p>
                    <div className="mt-4 space-y-3">
                        {profileItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#81C784]/12 text-[#2d6a31]">
                                        <Icon className="text-base" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                        <p className="text-sm text-slate-500">{item.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile Editor</p>
                            <h3 className="mt-2 text-2xl font-bold text-slate-950">Personal information</h3>
                            <p className="mt-1 text-sm text-slate-500">Update the core account details shown across your profile.</p>
                        </div>
                        {!isEditingProfile ? (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <FaEdit className="text-sm" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                                <span className="rounded-xl bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6a31]">
                                    Editing
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Full Name</label>
                            <input
                                type="text"
                                value={isEditingProfile ? editedData.name : userData.name}
                                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                disabled={!isEditingProfile}
                                className={`${inputClasses} ${!isEditingProfile ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                value={isEditingProfile ? editedData.email : userData.email}
                                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                disabled={!isEditingProfile}
                                className={`${inputClasses} ${!isEditingProfile ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Phone Number</label>
                            <input
                                type="tel"
                                value={isEditingProfile ? editedData.phone : userData.phone}
                                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                disabled={!isEditingProfile}
                                className={`${inputClasses} ${!isEditingProfile ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {isEditingProfile && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#81C784] px-5 py-3 font-semibold text-slate-950 transition hover:bg-[#72b875] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FaSave className="text-sm" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingProfile(false);
                                    setEditedData({
                                        name: userData.name || '',
                                        email: userData.email || '',
                                        phone: userData.phone || ''
                                    });
                                }}
                                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbf8_100%)] p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Security</p>
                            <h3 className="mt-2 text-2xl font-bold text-slate-950">Password & access</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage password protection to keep your account secure.
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                            <FaLock className="text-lg" />
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-[#81C784]/25 bg-[#81C784]/10 p-4">
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="mt-0.5 text-[#2d6a31]" />
                            <div>
                                <p className="font-semibold text-slate-900">Security check</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Use a strong password and update it regularly for safer account access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                        >
                            <FaKey className="text-sm" />
                            Change Password
                        </button>
                    ) : (
                        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                            <div className="mb-5 flex items-center justify-between">
                                <h4 className="text-lg font-bold text-slate-950">Update password</h4>
                                <button
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {passwordError && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {passwordError}
                                    </div>
                                )}

                                <div>
                                    <label className={labelClasses}>Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            className={inputClasses}
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                                        >
                                            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className={inputClasses}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className={inputClasses}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center rounded-2xl bg-[#81C784] px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-[#72b875] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? 'Changing...' : 'Change Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                            setPasswordError('');
                                        }}
                                        className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
