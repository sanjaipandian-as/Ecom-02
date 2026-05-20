import { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaPhone, FaShoppingBag, FaGlobe, FaSave, FaCheckCircle } from 'react-icons/fa';

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: true,
        newsletter: true
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings((prev) => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    const handleChange = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveSettings = () => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    const notificationOptions = [
        { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive account and service alerts in your inbox.', icon: FaEnvelope },
        { key: 'smsNotifications', title: 'SMS Notifications', desc: 'Get quick delivery and account updates by phone.', icon: FaPhone },
        { key: 'orderUpdates', title: 'Order Updates', desc: 'Stay informed on order status, shipping, and delivery.', icon: FaShoppingBag },
        { key: 'promotions', title: 'Promotions & Offers', desc: 'Receive curated deals, launches, and limited offers.', icon: FaGlobe },
        { key: 'newsletter', title: 'Newsletter', desc: 'Get product stories, highlights, and seasonal updates.', icon: FaBell }
    ];

    const enabledCount = notificationOptions.filter((item) => settings[item.key]).length;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#1f2937_52%,_#81C784_185%)] p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                <FaBell className="text-[11px]" />
                                Communication Controls
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">Notification center</h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">
                                Choose the messages that matter most, and quiet the ones that do not.
                            </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Enabled</p>
                            <p className="mt-2 text-3xl font-bold text-white">{enabledCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start gap-3">
                        <FaCheckCircle className="mt-1 text-[#2d6a31]" />
                        <div>
                            <h4 className="text-lg font-bold text-slate-950">Preference summary</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Your notification choices are stored locally for now, giving customers quick control over account updates, marketing messages, and order alerts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Message Preferences</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">Control every alert channel</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Turn channels on or off depending on how often you want to hear from us.
                    </div>
                </div>

                <div className="space-y-4">
                    {notificationOptions.map((item) => {
                        const ItemIcon = item.icon;
                        const isEnabled = settings[item.key];

                        return (
                            <div
                                key={item.key}
                                className={`rounded-[1.5rem] border p-5 transition-all ${
                                    isEnabled
                                        ? 'border-[#81C784]/35 bg-[linear-gradient(180deg,_rgba(129,199,132,0.08)_0%,_#ffffff_100%)]'
                                        : 'border-slate-200 bg-slate-50/70'
                                }`}
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                                isEnabled ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 shadow-sm'
                                            }`}
                                        >
                                            <ItemIcon className="text-lg" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex cursor-pointer items-center self-start sm:self-center">
                                        <input
                                            type="checkbox"
                                            checked={settings[item.key]}
                                            onChange={(e) => handleChange(item.key, e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-8 w-16 rounded-full bg-slate-200 shadow-inner transition peer-checked:bg-slate-950 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-8" />
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Save your selection to keep this communication setup active.</p>
                    <button
                        onClick={handleSaveSettings}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#81C784] px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-[#72b875]"
                    >
                        <FaSave className="text-sm" />
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
