import { useState, useEffect } from 'react';
import { MdRefresh, MdSave, MdCheck, MdClose, MdLock } from 'react-icons/md';
import API from '../../../../api';

const SLOT_STYLES = [
    { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', text: 'text-violet-700', chip: 'bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200', active: 'bg-violet-600 text-white border-violet-600' },
    { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-600', text: 'text-sky-700', chip: 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200', active: 'bg-sky-600 text-white border-sky-600' },
    { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200', active: 'bg-amber-500 text-white border-amber-500' },
    { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-500', text: 'text-rose-700', chip: 'bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200', active: 'bg-rose-500 text-white border-rose-500' },
];

const AdminBestSellerCategories = () => {
    const [selected, setSelected] = useState(['', '', '', '']);   // 4 chosen category names
    const [saved, setSaved]       = useState(['', '', '', '']);
    const [allCats, setAllCats]   = useState([]);                 // all categories from DB
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [resetting, setResetting] = useState(false);
    const [toast, setToast]       = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    // Fetch current config + all store categories in parallel
    const fetchAll = async () => {
        try {
            setLoading(true);
            const [configRes, catsRes] = await Promise.allSettled([
                API.get('/bestseller-config'),
                API.get('/categories'),
            ]);

            if (configRes.status === 'fulfilled') {
                const cats = configRes.value.data?.categories || [];
                const padded = [...cats, '', '', '', ''].slice(0, 4);
                setSelected(padded);
                setSaved(padded);
            }
            if (catsRes.status === 'fulfilled') {
                const raw = catsRes.value.data || [];
                // Only active categories
                const names = raw
                    .filter(c => c.isActive !== false)
                    .map(c => c.name);
                setAllCats(names);
            }
        } catch (err) {
            showToast('error', 'Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Toggle: if slot already has this cat → clear it; else assign it
    const toggleSlot = (slotIdx, catName) => {
        setSelected(prev => {
            const next = [...prev];
            next[slotIdx] = next[slotIdx] === catName ? '' : catName;
            return next;
        });
    };

    // Is a category already used in another slot?
    const usedInOtherSlot = (catName, slotIdx) =>
        selected.some((s, i) => i !== slotIdx && s === catName);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await API.put('/bestseller-config', { categories: selected });
            const cats = res.data.categories || [];
            const padded = [...cats, '', '', '', ''].slice(0, 4);
            setSaved(padded);
            setSelected(padded);
            showToast('success', 'Categories saved successfully!');
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            setResetting(true);
            const res = await API.post('/bestseller-config/reset');
            const cats = res.data.categories || [];
            const padded = [...cats, '', '', '', ''].slice(0, 4);
            setSaved(padded);
            setSelected(padded);
            showToast('success', 'Reset to defaults.');
        } catch (err) {
            showToast('error', 'Failed to reset.');
        } finally {
            setResetting(false);
        }
    };

    const isDirty = JSON.stringify(selected) !== JSON.stringify(saved);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 max-w-3xl">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <MdCheck size={18} /> : <MdClose size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Best Sellers — Category Tabs</h2>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Pick the <span className="font-semibold text-slate-700">4 category tabs</span> shown in the Best Sellers section.
                    <span className="font-semibold text-slate-700"> "All"</span> is always slot 1 and is locked.
                </p>
            </div>

            {/* Slot 1 – Locked "All" */}
            <div className="flex items-center gap-4 px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl mb-6">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black flex-shrink-0">1</div>
                <div className="flex-1">
                    <p className="text-[15px] font-bold text-slate-900">All</p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Default — always shown</p>
                </div>
                <MdLock className="text-slate-400" size={18} />
            </div>

            {/* Slots 2–5 */}
            <div className="space-y-5">
                {selected.map((chosen, slotIdx) => {
                    const s = SLOT_STYLES[slotIdx];
                    return (
                        <div key={slotIdx} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
                            {/* Slot header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-xl ${s.badge} text-white flex items-center justify-center text-sm font-black flex-shrink-0`}>
                                    {slotIdx + 2}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-[13px] font-bold uppercase tracking-widest ${s.text}`}>
                                        Slot {slotIdx + 2}
                                    </p>
                                </div>
                                {/* Selected pill */}
                                {chosen ? (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold border ${s.active}`}>
                                        <MdCheck size={12} />
                                        {chosen}
                                        <button
                                            onClick={() => toggleSlot(slotIdx, chosen)}
                                            className="ml-1 opacity-70 hover:opacity-100"
                                            title="Clear selection"
                                        >
                                            <MdClose size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`text-[12px] font-semibold ${s.text} opacity-60`}>None selected</span>
                                )}
                            </div>

                            {/* Category chips */}
                            {allCats.length === 0 ? (
                                <p className="text-[13px] text-slate-400 italic">No categories found in your store.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {allCats.map((cat) => {
                                        const isSelected = chosen === cat;
                                        const isDisabled = !isSelected && usedInOtherSlot(cat, slotIdx);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => !isDisabled && toggleSlot(slotIdx, cat)}
                                                disabled={isDisabled}
                                                className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
                                                    isSelected
                                                        ? s.active + ' shadow-sm scale-105'
                                                        : isDisabled
                                                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                                            : s.chip + ' cursor-pointer'
                                                }`}
                                            >
                                                {isSelected && <MdCheck className="inline mr-1 -mt-0.5" size={12} />}
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Live Preview */}
            <div className="mt-8 mb-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Live Preview</p>
                <div className="flex flex-wrap gap-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {['All', ...selected].map((tab, i) => (
                        <span
                            key={i}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
                                i === 0
                                    ? 'bg-black text-white shadow-md'
                                    : tab
                                        ? 'text-slate-600 border border-slate-200 bg-white'
                                        : 'text-slate-300 border border-dashed border-slate-200 bg-slate-50'
                            }`}
                        >
                            {tab || `Slot ${i + 1}`}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-md ${isDirty && !saving ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    {saving
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <MdSave size={16} />}
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>

                <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                >
                    <MdRefresh size={16} className={resetting ? 'animate-spin' : ''} />
                    {resetting ? 'Resetting…' : 'Reset to Defaults'}
                </button>

                {isDirty && (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                        Unsaved changes
                    </span>
                )}
            </div>
        </div>
    );
};

export default AdminBestSellerCategories;
