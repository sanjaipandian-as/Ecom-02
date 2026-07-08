import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MdCreditCard, MdAccountBalanceWallet, MdLocationOn, MdEdit,
    MdPerson, MdPhone, MdShoppingCart, MdLock, MdCheckCircle,
    MdArrowBack, MdErrorOutline, MdDelete, MdAdd, MdRemove,
    MdShoppingBag, MdPayments, MdOutlineSecurity, MdVerifiedUser,
    MdClose, MdSave, MdHome, MdApartment
} from 'react-icons/md';
import { SiVisa, SiMastercard, SiGooglepay, SiPhonepe } from 'react-icons/si';
import API from '../../../api';
import placeholderImg from '../../assets/Placeholder.png';
import Skeleton from '../Common/Skeleton';
import { formatAddress } from '../../utils/addressHelper';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { shippingAddress, product: directProduct, quantity: directQuantity } = location.state || {};

    const [selectedMethod, setSelectedMethod] = useState('cod');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(shippingAddress || null);
    const [orderCreated, setOrderCreated] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [shippingAddressString, setShippingAddressString] = useState('');
    const [toast, setToast] = useState({ show: false, type: '', message: '', subMessage: '' });
    const [acceptPolicy, setAcceptPolicy] = useState(false);

    // ---- Address change panel state ----
    const [showAddressPanel, setShowAddressPanel] = useState(false);
    // ---- Inline edit (edit currently selected address) ----
    const [showAddressEdit, setShowAddressEdit] = useState(false);
    const [editAddress, setEditAddress] = useState({
        fullname: '',
        addressLine: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });
    // ---- New Address form state ----
    const [newAddress, setNewAddress] = useState({
        fullname: '',
        addressLine: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });
    const [savingNewAddress, setSavingNewAddress] = useState(false);

    useEffect(() => {
        verifyCartAndPrepareAddress();
    }, []);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Sync editAddress form whenever selectedAddress changes
    useEffect(() => {
        if (selectedAddress && typeof selectedAddress === 'object') {
            setEditAddress({
                fullname: selectedAddress.fullname || selectedAddress.fullName || '',
                addressLine: selectedAddress.addressLine || selectedAddress.street || '',
                landmark: selectedAddress.landmark || '',
                city: selectedAddress.city || '',
                state: selectedAddress.state || '',
                pincode: selectedAddress.pincode || selectedAddress.zipCode || '',
                phone: selectedAddress.phone || selectedAddress.mobile || '',
            });
        }
    }, [selectedAddress]);

    const verifyCartAndPrepareAddress = async () => {
        try {
            if (directProduct) {
                setCartItems([{
                    productId: directProduct,
                    quantity: directQuantity || 1,
                    price: directProduct.pricing?.selling_price || directProduct.price || 0
                }]);
                if (!shippingAddress) await fetchAddresses();
                else {
                    setSelectedAddress(shippingAddress);
                    setShippingAddressString(formatAddress(shippingAddress));
                    setLoading(false);
                }
                return;
            }

            const response = await API.get('/cart');
            let items = response.data.items || [];

            const selectedIdsStr = localStorage.getItem('selectedCartItems');
            if (selectedIdsStr) {
                const selectedIds = JSON.parse(selectedIdsStr);
                items = items.filter(item =>
                    selectedIds.includes(item.productId?._id) || selectedIds.includes(item._id)
                );
            }

            if (items.length === 0) {
                setToast({ show: true, type: 'error', message: 'Empty Selection', subMessage: 'No items selected for payment.' });
                navigate('/Cart');
                return;
            }

            setCartItems(items);

            if (!shippingAddress) await fetchAddresses();
            else {
                setSelectedAddress(shippingAddress);
                setShippingAddressString(formatAddress(shippingAddress));
                setLoading(false);
            }
        } catch (error) {
            console.error('Error verifying cart/selection:', error);
            setError('Failed to verify items. Please try again.');
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await API.get('/address');
            const userAddresses = response.data || [];
            setAddresses(userAddresses);

            if (userAddresses.length === 0) {
                setError('Please add a delivery address in Settings before placing an order.');
                setLoading(false);
                return;
            }

            const defaultAddr = userAddresses.find(addr => addr.isDefault);
            const addressToUse = defaultAddr || userAddresses[0];
            setSelectedAddressId(addressToUse._id);
            setSelectedAddress(addressToUse);
            setShippingAddressString(formatAddress(addressToUse));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to fetch addresses. Please try again.');
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await API.delete(`/cart/remove/${productId}`);
            const updatedItems = cartItems.filter(item => (item.productId?._id || item.productId) !== productId);
            setCartItems(updatedItems);
            if (updatedItems.length === 0) {
                setToast({ show: true, type: 'error', message: 'Cart is Empty', subMessage: 'Redirecting to home...' });
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to Remove Item', subMessage: 'Please try again' });
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await API.put('/cart/update', { productId, quantity: newQuantity });
            setCartItems(cartItems.map(item =>
                (item.productId?._id || item.productId) === productId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to Update Quantity', subMessage: 'Please try again' });
        }
    };

    const handleSelectAddress = (address) => {
        setSelectedAddressId(address._id);
        setSelectedAddress(address);
        setShippingAddressString(formatAddress(address));
        setShowAddressPanel(false);
        setShowAddressEdit(false);
    };

    // Save inline edit to local selectedAddress state
    const handleSaveAddressEdit = () => {
        const updated = {
            ...(selectedAddress || {}),
            fullname: editAddress.fullname,
            addressLine: editAddress.addressLine,
            landmark: editAddress.landmark,
            city: editAddress.city,
            state: editAddress.state,
            pincode: editAddress.pincode,
            phone: editAddress.phone,
        };
        setSelectedAddress(updated);
        setShippingAddressString(formatAddress(updated));
        setShowAddressEdit(false);
        setToast({ show: true, type: 'success', message: 'Address Updated', subMessage: 'Your delivery address has been updated.' });
    };

    // Save brand-new address to DB and set it as selected
    const handleSaveNewAddress = async () => {
        const { fullname, addressLine, city, state, pincode, phone } = newAddress;
        if (!fullname || !addressLine || !city || !state || !pincode || !phone) {
            setToast({ show: true, type: 'error', message: 'Incomplete Address', subMessage: 'Please fill all required fields.' });
            return;
        }
        try {
            setSavingNewAddress(true);
            const response = await API.post('/address', {
                fullname,
                addressLine,
                landmark: newAddress.landmark,
                city,
                state,
                pincode,
                phone,
                country: 'India',
                isDefault: addresses.length === 0,
            });
            const saved = response.data?.address || response.data;
            setAddresses(prev => [...prev, saved]);
            setSelectedAddressId(saved._id);
            setSelectedAddress(saved);
            setShippingAddressString(formatAddress(saved));
            setNewAddress({ fullname: '', addressLine: '', landmark: '', city: '', state: '', pincode: '', phone: '' });
            setShowAddressPanel(false);
            setToast({ show: true, type: 'success', message: 'New Address Saved!', subMessage: 'Delivering to your new address.' });
        } catch (err) {
            setToast({ show: true, type: 'error', message: 'Save Failed', subMessage: err.response?.data?.message || 'Could not save address.' });
        } finally {
            setSavingNewAddress(false);
        }
    };

    const createOrder = async () => {
        if (orderCreated) return order;
        if (!selectedAddress) {
            setToast({ show: true, type: 'error', message: 'Address Required', subMessage: 'Please select a shipping address' });
            return;
        }

        const orderAddress = {
            street: selectedAddress.addressLine || selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.pincode || selectedAddress.zipCode,
            country: selectedAddress.country || 'India',
            mobile: selectedAddress.phone || selectedAddress.mobile
        };

        try {
            setProcessing(true);
            const payload = {
                shippingAddress: orderAddress,
                paymentMethod: selectedMethod === 'cod' ? 'cod' : 'online',
            };

            if (directProduct) {
                payload.directItems = [{ productId: directProduct._id, quantity: directQuantity || 1 }];
            } else {
                const selectedIdsStr = localStorage.getItem('selectedCartItems');
                if (selectedIdsStr) payload.cartItemIds = JSON.parse(selectedIdsStr);
            }

            const response = await API.post('/orders/create', payload);
            setOrder(response.data.order);
            setOrderCreated(true);
            setError('');
            return response.data.order;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to initiate order.';
            setToast({ show: true, type: 'error', message: 'Order Creation Failed', subMessage: errorMessage });
            throw error;
        } finally {
            setProcessing(false);
        }
    };

    const loadRazorpayScript = () => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handleRazorpayPayment = async () => {
        try {
            setProcessing(true);
            const checkoutItems = cartItems.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                price: item.price || item.productId?.pricing?.selling_price || 0
            }));

            const { data } = await API.post('/payment/order', { items: checkoutItems });
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setToast({ show: true, type: 'error', message: 'Connection Error', subMessage: 'Failed to load Payment Gateway.' });
                setProcessing(false);
                return;
            }

            const userStr = localStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : {};

            const options = {
                key: data.razorpayKey,
                amount: data.paymentOrder.amount,
                currency: data.paymentOrder.currency,
                name: 'Plenora',
                description: `Order Payment - ${Date.now()}`,
                image: '',
                order_id: data.paymentOrder.id,
                prefill: {
                    name: userData.fullname || userData.name || userData.username || '',
                    email: userData.email || '',
                    contact: selectedAddress?.phone || userData.phone || '',
                    method: 'upi' // Prefill UPI as default
                },
                theme: { color: '#6d9b7a' },
                // Restrict options list to UPI only
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: 'UPI / QR Code',
                                instruments: [
                                    {
                                        method: 'upi'
                                    }
                                ]
                            }
                        },
                        sequence: ['block.upi'],
                        preferences: {
                            show_default_blocks: false
                        }
                    }
                },
                handler: async function (response) {
                    try {
                        const orderAddress = {
                            street: selectedAddress.addressLine || selectedAddress.street,
                            city: selectedAddress.city,
                            state: selectedAddress.state,
                            zipCode: selectedAddress.pincode || selectedAddress.zipCode,
                            country: selectedAddress.country || 'India',
                            mobile: selectedAddress.phone || selectedAddress.mobile
                        };

                        const verifyResponse = await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: {
                                items: checkoutItems,
                                shippingAddress: orderAddress,
                                sourceCartItems: directProduct ? [] : cartItems
                            }
                        });

                        setOrder(verifyResponse.data.order);
                        setOrderCreated(true);
                        setToast({ show: true, type: 'success', message: 'Payment Successful!', subMessage: 'Order Confirmed' });
                        localStorage.removeItem('selectedCartItems');
                        setTimeout(() => navigate('/'), 2000);
                    } catch (error) {
                        setToast({ show: true, type: 'error', message: 'Payment Verification Failed', subMessage: 'Please contact support' });
                    }
                },
                modal: { ondismiss: () => setProcessing(false) }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to initiate payment.';
            setToast({ show: true, type: 'error', message: 'Payment Blocked', subMessage: errorMsg });
            setProcessing(false);
        }
    };

    const handleCODPayment = async () => {
        try {
            setProcessing(true);
            let currentOrder = order;
            if (!orderCreated) currentOrder = await createOrder();
            if (!currentOrder) {
                setToast({ show: true, type: 'error', message: 'Failed to Create Order', subMessage: 'Please try again' });
                setProcessing(false);
                return;
            }
            setToast({ show: true, type: 'success', message: 'Order Placed!', subMessage: 'Pay on Delivery' });
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Failed to Place Order', subMessage: 'Please try again' });
            setProcessing(false);
        }
    };

    const handlePayment = () => {
        if (processing || orderCreated) return;
        if (!selectedAddress) {
            setToast({ show: true, type: 'error', message: 'Address Required', subMessage: 'Please select or add a shipping address to proceed.' });
            return;
        }
        if (!acceptPolicy) {
            setToast({ show: true, type: 'error', message: 'Policy Required', subMessage: 'Please accept the terms to continue' });
            return;
        }
        if (selectedMethod === 'cod') handleCODPayment();
        else handleRazorpayPayment();
    };

    const calculateTotal = () => {
        if (order) return order.totalAmount || 0;
        const subtotal = cartItems.reduce((sum, item) => {
            const itemPrice = item.price || item.productId?.pricing?.selling_price || item.productId?.price || 0;
            return sum + (itemPrice * (item.quantity || 1));
        }, 0);
        return subtotal;
    };

    const subtotal = calculateTotal();
    const shippingFee = subtotal > 999 ? 0 : 99;
    const total = subtotal + shippingFee;

    // ---- Loading State ----
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#6d9b7a] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-500 font-semibold text-lg">Loading your checkout...</p>
                </div>
            </div>
        );
    }

    // ---- Error State ----
    if (error) {
        return (
            <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center">
                <div className="bg-white rounded-3xl p-12 max-w-md w-full mx-4 text-center shadow-xl border border-slate-100">
                    <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MdErrorOutline className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Checkout Interrupted</h2>
                    <p className="text-slate-500 text-base mb-8">{error}</p>
                    <button
                        onClick={() => navigate(error.includes('address') ? '/Settings' : '/')}
                        className="w-full py-4 bg-slate-900 text-white font-bold text-base rounded-2xl hover:bg-slate-800 transition-all"
                    >
                        {error.includes('address') ? 'Go to Settings' : 'Return Home'}
                    </button>
                </div>
            </div>
        );
    }

    // ---- Input field style helper ----
    const inputCls = "w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all";
    const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

    return (
        <div style={{ fontFamily: "'Boston Angel', serif" }} className="min-h-screen bg-[#f4f7f5]">

            {/* Toast */}
            {toast.show && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4">
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'}`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            {toast.type === 'success' ? <MdCheckCircle className="w-6 h-6" /> : <MdErrorOutline className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 text-base">{toast.message}</p>
                            <p className="text-sm text-slate-400 mt-0.5">{toast.subMessage}</p>
                        </div>
                        <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-300 hover:text-slate-500">
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-colors text-base font-semibold"
                    >
                        <MdArrowBack className="w-6 h-6" />
                        Back
                    </button>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Checkout</span>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                        <MdLock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SSL Secured</span>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <main className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ===== LEFT COLUMN: Address + Payment ===== */}
                    <div className="space-y-5">

                        {/* Delivery Address Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#6d9b7a] rounded-xl flex items-center justify-center">
                                        <MdLocationOn style={{ width: '22px', height: '22px', color: 'white' }} />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-slate-900 text-base">Delivery Address</h2>
                                        <p className="text-sm text-slate-400 font-medium">Where should we send it?</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedAddress && !showAddressPanel && (
                                        <button
                                            onClick={() => setShowAddressEdit(!showAddressEdit)}
                                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${showAddressEdit
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {showAddressEdit ? <MdClose className="w-4 h-4" /> : <MdEdit className="w-4 h-4" />}
                                            {showAddressEdit ? 'Cancel' : 'Edit'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setShowAddressPanel(!showAddressPanel); setShowAddressEdit(false); }}
                                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${showAddressPanel
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'text-[#6d9b7a] bg-emerald-50 border-emerald-200 hover:bg-[#6d9b7a] hover:text-white hover:border-[#6d9b7a]'
                                            }`}
                                    >
                                        {showAddressPanel ? <MdClose className="w-4 h-4" /> : <MdAdd className="w-4 h-4" />}
                                        {showAddressPanel ? 'Close' : 'Change'}
                                    </button>
                                </div>
                            </div>

                            {/* ===== EDIT CURRENT ADDRESS FORM ===== */}
                            {showAddressEdit && !showAddressPanel && (
                                <div className="px-6 py-5 bg-amber-50/60 border-b border-amber-100">
                                    <p className="text-sm font-bold text-amber-700 mb-4 flex items-center gap-2">
                                        <MdEdit className="w-4 h-4" /> Editing Current Address
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className={labelCls}>Full Name *</label>
                                            <div className="relative">
                                                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input type="text" value={editAddress.fullname}
                                                    onChange={(e) => setEditAddress({ ...editAddress, fullname: e.target.value })}
                                                    placeholder="Recipient's full name"
                                                    className={`${inputCls} pl-11`}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelCls}>Street Address *</label>
                                            <div className="relative">
                                                <MdHome className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input type="text" value={editAddress.addressLine}
                                                    onChange={(e) => setEditAddress({ ...editAddress, addressLine: e.target.value })}
                                                    placeholder="House no., Street, Area"
                                                    className={`${inputCls} pl-11`}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelCls}>Landmark (Optional)</label>
                                            <div className="relative">
                                                <MdApartment className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input type="text" value={editAddress.landmark}
                                                    onChange={(e) => setEditAddress({ ...editAddress, landmark: e.target.value })}
                                                    placeholder="Near school, opposite mall..."
                                                    className={`${inputCls} pl-11`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>City *</label>
                                            <input type="text" value={editAddress.city}
                                                onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                                                placeholder="City" className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>State *</label>
                                            <input type="text" value={editAddress.state}
                                                onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                                                placeholder="State" className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>PIN Code *</label>
                                            <input type="text" value={editAddress.pincode}
                                                onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                                placeholder="6-digit PIN" maxLength={6} className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phone *</label>
                                            <div className="relative">
                                                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input type="tel" value={editAddress.phone}
                                                    onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                    placeholder="10-digit number" maxLength={10}
                                                    className={`${inputCls} pl-11`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleSaveAddressEdit}
                                        className="mt-4 w-full py-3.5 bg-[#6d9b7a] text-white font-bold text-sm rounded-xl hover:bg-[#5a8568] transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MdSave className="w-5 h-5" /> Save Changes
                                    </button>
                                </div>
                            )}

                            {/* ===== CHANGE ADDRESS PANEL ===== */}
                            {showAddressPanel && (
                                <div className="border-t border-slate-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

                                        {/* LEFT: Saved Addresses */}
                                        <div className="p-5">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <MdVerifiedUser className="w-4 h-4" /> Saved Addresses
                                            </p>
                                            {addresses.length === 0 ? (
                                                <div className="text-center py-8 bg-slate-50 rounded-xl">
                                                    <MdLocationOn className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-400 font-medium">No saved addresses</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                                    {addresses.map((address) => (
                                                        <div
                                                            key={address._id}
                                                            onClick={() => handleSelectAddress(address)}
                                                            className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedAddressId === address._id
                                                                    ? 'border-[#6d9b7a] bg-emerald-50'
                                                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedAddressId === address._id ? 'border-[#6d9b7a] bg-[#6d9b7a]' : 'border-slate-300'
                                                                }`}>
                                                                {selectedAddressId === address._id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <span className="font-bold text-sm text-slate-900">{address.fullname}</span>
                                                                    {address.isDefault && (
                                                                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded uppercase">Default</span>
                                                                    )}
                                                                    {selectedAddressId === address._id && (
                                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded uppercase">Active</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                                    {address.addressLine}{address.landmark ? `, ${address.landmark}` : ''}
                                                                </p>
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    {address.city}, {address.state} - {address.pincode}
                                                                </p>
                                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                                    <MdPhone className="w-3.5 h-3.5" />{address.phone}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* RIGHT: Add New Address */}
                                        <div className="p-5 bg-slate-50/50">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <MdAdd className="w-4 h-4" /> Add New Address
                                            </p>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={labelCls}>Full Name *</label>
                                                    <div className="relative">
                                                        <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input type="text" value={newAddress.fullname}
                                                            onChange={(e) => setNewAddress({ ...newAddress, fullname: e.target.value })}
                                                            placeholder="Full name"
                                                            className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Street Address *</label>
                                                    <div className="relative">
                                                        <MdHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input type="text" value={newAddress.addressLine}
                                                            onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                                                            placeholder="House no., Street, Area"
                                                            className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Landmark</label>
                                                    <div className="relative">
                                                        <MdApartment className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input type="text" value={newAddress.landmark}
                                                            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                                                            placeholder="Landmark (optional)"
                                                            className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <label className={labelCls}>City *</label>
                                                        <input type="text" value={newAddress.city}
                                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                            placeholder="City"
                                                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>State *</label>
                                                        <input type="text" value={newAddress.state}
                                                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                            placeholder="State"
                                                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>PIN Code *</label>
                                                        <input type="text" value={newAddress.pincode}
                                                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                                            placeholder="6-digit" maxLength={6}
                                                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Phone *</label>
                                                        <div className="relative">
                                                            <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <input type="tel" value={newAddress.phone}
                                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                                placeholder="10 digits" maxLength={10}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6d9b7a] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSaveNewAddress}
                                                    disabled={savingNewAddress}
                                                    className="w-full py-3 bg-[#6d9b7a] text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#5a8568] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    {savingNewAddress ? (
                                                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                                                    ) : (
                                                        <><MdSave className="w-4 h-4" /> Save & Deliver Here</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== ADDRESS DISPLAY (default view) ===== */}
                            {!showAddressPanel && !showAddressEdit && (
                                <div className="px-6 py-5">
                                    {selectedAddress ? (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MdVerifiedUser className="w-5 h-5 text-[#6d9b7a]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-black text-slate-900 text-base">
                                                        {selectedAddress?.fullname || selectedAddress?.fullName || 'Recipient'}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-[#6d9b7a] text-[10px] font-bold rounded border border-emerald-100 uppercase tracking-wider">Verified</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                    {selectedAddress?.addressLine || selectedAddress?.street}
                                                    {selectedAddress?.landmark ? `, ${selectedAddress.landmark}` : ''}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                                    {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode || selectedAddress?.zipCode}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MdPhone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-500">{selectedAddress?.phone || selectedAddress?.mobile || 'No contact'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-400 text-base">No address selected</p>
                                            <button onClick={() => setShowAddressPanel(true)} className="mt-2 text-[#6d9b7a] text-sm font-bold hover:underline">+ Add Address</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                                    <MdCreditCard style={{ width: '22px', height: '22px', color: 'white' }} />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900 text-base">Payment Method</h2>
                                    <p className="text-sm text-slate-400 font-medium">Choose how to pay</p>
                                </div>
                            </div>

                            <div className="p-5 grid grid-cols-2 gap-4">
                                {/* Online Payment */}
                                <div
                                    onClick={() => setSelectedMethod('online')}
                                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${selectedMethod === 'online'
                                        ? 'border-[#6d9b7a] bg-emerald-50/50'
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === 'online' ? 'bg-[#6d9b7a] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                            <MdAccountBalanceWallet className="w-5 h-5" />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'online' ? 'border-[#6d9b7a] bg-[#6d9b7a]' : 'border-slate-300'}`}>
                                            {selectedMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <p className="font-black text-sm text-slate-900 mb-1">Online Pay</p>
                                    <p className="text-xs text-slate-400 font-medium mb-3">UPI, Card, Wallet</p>
                                    <div className="flex items-center gap-2">
                                        <SiGooglepay className="w-6 h-6 text-slate-500" />
                                        <SiPhonepe className="w-5 h-5 text-slate-500" />
                                        <SiVisa className="w-6 h-6 text-slate-500" />
                                    </div>
                                </div>

                                {/* Cash on Delivery */}
                                <div
                                    onClick={() => setSelectedMethod('cod')}
                                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${selectedMethod === 'cod'
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === 'cod' ? 'bg-white text-slate-900' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                            <MdPayments className="w-5 h-5" />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'cod' ? 'border-white bg-white' : 'border-slate-300'}`}>
                                            {selectedMethod === 'cod' && <div className="w-2 h-2 bg-slate-900 rounded-full" />}
                                        </div>
                                    </div>
                                    <p className={`font-black text-sm mb-1 ${selectedMethod === 'cod' ? 'text-white' : 'text-slate-900'}`}>Cash on Delivery</p>
                                    <p className={`text-xs font-medium mb-3 ${selectedMethod === 'cod' ? 'text-slate-400' : 'text-slate-400'}`}>Pay when received</p>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${selectedMethod === 'cod' ? 'bg-white/10 text-slate-300 border border-white/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                        Available
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Policy + Place Order */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <label className="flex items-start gap-3 cursor-pointer mb-5">
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={acceptPolicy}
                                        onChange={(e) => setAcceptPolicy(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white transition-all checked:bg-[#6d9b7a] checked:border-[#6d9b7a] cursor-pointer"
                                    />
                                    <MdCheckCircle className="absolute top-0 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
                                </div>
                                <span className="text-sm text-slate-500 leading-relaxed font-medium">
                                    I agree to the{' '}
                                    <a href="/privacy" className="text-[#6d9b7a] hover:underline font-bold">Privacy Policy</a>
                                    {' '}and{' '}
                                    <a href="/terms" className="text-[#6d9b7a] hover:underline font-bold">Terms of Service</a>
                                    . I authorize this transaction.
                                </span>
                            </label>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className={`w-full py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${processing
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-200'}`}
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <MdLock className="w-5 h-5" />
                                        {selectedMethod === 'cod' ? ('Place Order - Rs.' + total.toLocaleString()) : ('Pay Rs.' + total.toLocaleString())}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400 font-medium mt-4 flex items-center justify-center gap-1.5">
                                <MdLock className="w-3.5 h-3.5" />
                                256-bit SSL Encrypted & Secured
                            </p>
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN: Order Items + Summary ===== */}
                    <div className="space-y-5">

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <MdShoppingBag style={{ width: '22px', height: '22px', color: 'white' }} />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900 text-base">Your Items</h2>
                                    <p className="text-sm text-slate-400 font-medium">{order?.items?.length || cartItems.length} item(s) in order</p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                                {(order?.items || cartItems)?.map((item, index) => {
                                    const productId = item.productId?._id || item.productId;
                                    const productImage = item.productId?.images?.[0] || item.images?.[0] || placeholderImg;
                                    const productName = item.productId?.name || item.name || 'Product';
                                    const itemPrice = item.price || item.productId?.pricing?.selling_price || item.productId?.price || 0;

                                    return (
                                        <div key={index} className="group flex items-center gap-4 px-6 py-4">
                                            <div className="w-18 h-18 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0" style={{ width: '64px', height: '64px' }}>
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = placeholderImg; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 text-sm truncate">{productName}</h3>
                                                <p className="text-xs text-slate-400 mt-0.5 font-medium">{item.productId?.category?.main || 'Skincare'}</p>
                                                {!order && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button onClick={() => handleUpdateQuantity(productId, item.quantity - 1)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                                                            <MdRemove className="w-3.5 h-3.5 text-slate-500" />
                                                        </button>
                                                        <span className="text-sm font-bold text-slate-900 w-5 text-center">{item.quantity}</span>
                                                        <button onClick={() => handleUpdateQuantity(productId, item.quantity + 1)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                                                            <MdAdd className="w-3.5 h-3.5 text-slate-500" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-black text-slate-900 text-base">Rs.{(itemPrice * item.quantity).toLocaleString()}</p>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">Rs.{itemPrice.toLocaleString()} x {item.quantity}</p>
                                                {!order && (
                                                    <button
                                                        onClick={() => handleRemoveItem(productId)}
                                                        className="mt-1.5 text-slate-300 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100">
                                <h2 className="font-black text-slate-900 text-base">Price Summary</h2>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Item Total</span>
                                    <span className="text-sm font-bold text-slate-900">Rs.{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Shipping</span>
                                    <span className={shippingFee === 0 ? "text-sm font-bold text-[#6d9b7a]" : "text-sm font-bold text-slate-900"}>
                                        {shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Taxes</span>
                                    <span className="text-sm font-medium text-slate-400">Included</span>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-slate-900 text-lg">Total</span>
                                        <span className="font-black text-slate-900 text-2xl">Rs.{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: <MdCheckCircle className="w-5 h-5 text-[#6d9b7a]" />, label: 'Genuine Products', bg: 'bg-emerald-50' },
                                { icon: <MdOutlineSecurity className="w-5 h-5 text-blue-500" />, label: 'Secure Payment', bg: 'bg-blue-50' },
                                { icon: <MdShoppingBag className="w-5 h-5 text-amber-500" />, label: 'Easy Returns', bg: 'bg-amber-50' },
                            ].map((badge, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
                                    <div className={`w-10 h-10 ${badge.bg} rounded-xl flex items-center justify-center mx-auto mb-2.5`}>
                                        {badge.icon}
                                    </div>
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide leading-tight">{badge.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
