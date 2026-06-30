import React, { useState, useEffect } from 'react';
import API from '../../../../api';
import { toast } from 'react-toastify';
import { MdSave, MdCampaign } from 'react-icons/md';

const AdminAnnouncementManagement = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        message: '',
        discountText: '',
        endDate: '',
        link: '',
        isActive: false
    });

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await API.get('/announcements/admin');
                if (response.data) {
                    const data = response.data;
                    // Format date for datetime-local input
                    const formattedDate = data.endDate 
                        ? new Date(data.endDate).toISOString().slice(0, 16) 
                        : '';
                    
                    setFormData({
                        message: data.message || '',
                        discountText: data.discountText || '',
                        endDate: formattedDate,
                        link: data.link || '',
                        isActive: data.isActive || false
                    });
                }
            } catch (error) {
                console.error('Error fetching announcement:', error);
            }
        };
        fetchAnnouncement();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/announcements', formData);
            toast.success('Announcement updated successfully');
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast.error(error.response?.data?.message || 'Error updating announcement');
        } finally {
            setLoading(false);
        }
    };

    const handleEndAnnouncement = async () => {
        if (!window.confirm("Are you sure you want to completely end and remove the current announcement?")) return;
        setLoading(true);
        try {
            await API.delete('/announcements');
            setFormData({
                message: '',
                discountText: '',
                endDate: '',
                link: '',
                isActive: false
            });
            toast.success('Announcement ended and removed completely');
        } catch (error) {
            console.error('Error ending announcement:', error);
            toast.error(error.response?.data?.message || 'Error ending announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <MdCampaign className="text-indigo-600" />
                    Announcement Bar Management
                </h1>
                <p className="text-slate-500 mt-2 text-sm md:text-base">
                    Configure the global announcement banner displayed at the top of the store.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Enable Announcement Bar</h3>
                            <p className="text-xs text-slate-500 mt-1">Show or hide the banner across the entire site.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isActive" 
                                className="sr-only peer" 
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Message */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Main Message <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="message"
                                required
                                placeholder="e.g., Milk Drops Serum at flat"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>

                        {/* Discount Text */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Highlighted Text (Discount)
                            </label>
                            <input
                                type="text"
                                name="discountText"
                                placeholder="e.g., 20% off"
                                value={formData.discountText}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>

                        {/* Link */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Target Link URL (Optional)
                            </label>
                            <input
                                type="text"
                                name="link"
                                placeholder="e.g., /product/milk-drops-serum"
                                value={formData.link}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                            />
                            <p className="text-xs text-slate-500">Users will be redirected here when they click 'Shop now!'. Use relative paths like /product/slug</p>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Countdown End Date (Optional)
                            </label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                            />
                            <p className="text-xs text-slate-500">If set, a countdown timer will appear on the banner.</p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 text-sm mb-4">Live Preview</h3>
                        <div className={`transition-opacity duration-300 ${formData.isActive ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="bg-[#B81D1D] text-white py-2 px-4 w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-semibold tracking-wide rounded-lg">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1 text-center">
                                        <span>{formData.message || 'Sample Message'}</span>
                                        <span className="font-bold">{formData.discountText || 'Discount'}</span>
                                    </div>
                                    {formData.endDate && (
                                        <span className="text-[11px] uppercase opacity-90 mt-0.5 font-normal tracking-widest">ends in</span>
                                    )}
                                </div>
                                {formData.endDate && (
                                    <div className="flex items-center gap-2">
                                        <span>00 : 00 : 00 : 00</span>
                                    </div>
                                )}
                                {formData.link && (
                                    <button className="mt-1 sm:mt-0 ml-0 sm:ml-4 text-white text-sm font-medium border border-white/40 px-3 py-1 rounded">
                                        Shop now!
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleEndAnnouncement}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 border border-red-200"
                        >
                            End Announcement
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><MdSave className="text-lg" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAnnouncementManagement;
