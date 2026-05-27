import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSave, FaHome } from 'react-icons/fa';
import API from '../../../api';
import Skeleton from '../../components/Common/Skeleton';

const AddressManagement = () => {
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullname: '',
        phone: '',
        pincode: '',
        state: '',
        city: '',
        addressLine: '',
        landmark: ''
    });

    const inputClasses = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#81C784] focus:ring-4 focus:ring-[#81C784]/15';
    const labelClasses = 'mb-2 block text-sm font-semibold text-slate-700';

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const response = await API.get('/address');
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            alert('Failed to load addresses');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (addressForm.phone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            await API.post('/address', addressForm);
            alert('Address added successfully!');
            setShowAddressForm(false);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
            alert(error.response?.data?.message || 'Failed to add address');
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        if (addressForm.phone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            await API.put(`/address/${editingAddress}`, addressForm);
            alert('Address updated successfully!');
            setEditingAddress(null);
            setShowAddressForm(false);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error updating address:', error);
            alert(error.response?.data?.message || 'Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await API.delete(`/address/${addressId}`);
            alert('Address deleted successfully!');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert(error.response?.data?.message || 'Failed to delete address');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await API.put(`/address/default/${addressId}`);
            alert('Default address updated!');
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            alert(error.response?.data?.message || 'Failed to set default address');
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address._id);
        setAddressForm({
            fullname: address.fullname,
            phone: address.phone,
            pincode: address.pincode,
            state: address.state,
            city: address.city,
            addressLine: address.addressLine,
            landmark: address.landmark || ''
        });
        setShowAddressForm(true);
    };

    const resetAddressForm = () => {
        setAddressForm({
            fullname: '',
            phone: '',
            pincode: '',
            state: '',
            city: '',
            addressLine: '',
            landmark: ''
        });
        setEditingAddress(null);
    };

    const defaultAddress = addresses.find((address) => address.isDefault);
    const statCards = [
        { label: 'Saved Addresses', value: addresses.length },
        { label: 'Default Address', value: defaultAddress ? '1 active' : 'Not set' },
        { label: 'Coverage', value: addresses.length > 1 ? 'Multi-location' : 'Single location' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#1f2937_50%,_#81C784_185%)] p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                <FaMapMarkerAlt className="text-[11px]" />
                                Delivery Network
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">Address book</h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">
                                Keep your delivery destinations clean and organized so checkout stays fast and accurate.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                resetAddressForm();
                                setShowAddressForm(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                        >
                            <FaPlus className="text-xs" />
                            Add Address
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {statCards.map((card) => (
                        <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                            <p className="mt-3 text-2xl font-bold text-slate-950">{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {showAddressForm && (
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbf8_100%)] p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Address Form</p>
                            <h3 className="mt-2 text-2xl font-bold text-slate-950">
                                {editingAddress ? 'Edit saved address' : 'Add new address'}
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddressForm(false);
                                resetAddressForm();
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClasses}>Full Name</label>
                                <input
                                    type="text"
                                    value={addressForm.fullname}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullname: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    className={inputClasses}
                                    placeholder="9876543210"
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Address Line</label>
                                <input
                                    type="text"
                                    value={addressForm.addressLine}
                                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                                    className={inputClasses}
                                    placeholder="House No., Building Name, Street"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Landmark</label>
                                <input
                                    type="text"
                                    value={addressForm.landmark}
                                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Nearby landmark"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    className={inputClasses}
                                    placeholder="City"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>State</label>
                                <input
                                    type="text"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    className={inputClasses}
                                    placeholder="State"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>PIN Code</label>
                                <input
                                    type="text"
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    className={inputClasses}
                                    placeholder="600001"
                                    pattern="[0-9]{6}"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    resetAddressForm();
                                }}
                                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#81C784] px-5 py-3 font-semibold text-slate-950 transition hover:bg-[#72b875]"
                            >
                                <FaSave className="text-sm" />
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loadingAddresses ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="mt-5 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="mt-5 flex gap-2">
                                <Skeleton className="h-11 flex-1 rounded-2xl" />
                                <Skeleton className="h-11 flex-1 rounded-2xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                        <FaHome className="text-2xl" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">No addresses saved yet</h3>
                    <p className="mt-2 text-sm text-slate-500">Add your first delivery address to streamline checkout.</p>
                    <button
                        onClick={() => {
                            resetAddressForm();
                            setShowAddressForm(true);
                        }}
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        <FaPlus className="text-xs" />
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`rounded-[1.75rem] border p-6 transition-all ${
                                address.isDefault
                                    ? 'border-[#81C784]/40 bg-[linear-gradient(180deg,_rgba(129,199,132,0.09)_0%,_#ffffff_100%)] shadow-[0_20px_60px_-35px_rgba(129,199,132,0.55)]'
                                    : 'border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                            address.isDefault ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        <FaMapMarkerAlt className="text-base" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-950">{address.fullname}</h4>
                                        <p className="text-sm text-slate-500">{address.phone}</p>
                                    </div>
                                </div>
                                {address.isDefault && (
                                    <span className="rounded-full bg-[#81C784] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950">
                                        Default
                                    </span>
                                )}
                            </div>

                            <div className="mt-5 rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                                <p>{address.addressLine}</p>
                                {address.landmark && <p className="text-slate-500">Landmark: {address.landmark}</p>}
                                <p>
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefaultAddress(address._id)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#81C784]/12 px-4 py-3 text-sm font-semibold text-[#2d6a31] transition hover:bg-[#81C784]/18"
                                    >
                                        <FaCheck className="text-xs" />
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEditAddress(address)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                >
                                    <FaEdit className="text-xs" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address._id)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                    <FaTrash className="text-xs" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressManagement;
