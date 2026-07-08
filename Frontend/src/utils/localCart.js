import API from '../../api';

// --- CART METHODS ---

export const getLocalCart = () => {
    try {
        const cart = localStorage.getItem('localCart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error reading local cart', e);
        return [];
    }
};

export const setLocalCart = (cart) => {
    try {
        localStorage.setItem('localCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error('Error saving local cart', e);
    }
};

export const addToLocalCart = (product, quantity = 1) => {
    const cart = getLocalCart();
    const existingIndex = cart.findIndex(item => {
        const id = item.productId?._id || item.productId;
        return id === product._id;
    });
    
    const availableStock = product.stock || 0;
    
    if (existingIndex >= 0) {
        const newQty = cart[existingIndex].quantity + quantity;
        if (newQty > availableStock) {
            throw new Error(`Only ${availableStock} pieces available in stock.`);
        }
        cart[existingIndex].quantity = newQty;
    } else {
        if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} pieces available in stock.`);
        }
        cart.push({
            productId: product,
            quantity: quantity
        });
    }
    setLocalCart(cart);
    return cart;
};

export const updateLocalCartQuantity = (productId, quantity) => {
    const cart = getLocalCart();
    const itemIndex = cart.findIndex(item => {
        const id = item.productId?._id || item.productId;
        return id === productId;
    });

    if (itemIndex >= 0) {
        const availableStock = cart[itemIndex].productId?.stock || 0;
        if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} pieces available in stock.`);
        }
        cart[itemIndex].quantity = quantity;
        setLocalCart(cart);
    }
    return cart;
};

export const removeFromLocalCart = (productId) => {
    let cart = getLocalCart();
    cart = cart.filter(item => {
        const id = item.productId?._id || item.productId;
        return id !== productId;
    });
    setLocalCart(cart);
    return cart;
};

export const clearLocalCart = () => {
    try {
        localStorage.removeItem('localCart');
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error('Error clearing local cart', e);
    }
};


// --- WISHLIST METHODS ---

export const getLocalWishlist = () => {
    try {
        const wishlist = localStorage.getItem('localWishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (e) {
        console.error('Error reading local wishlist', e);
        return [];
    }
};

export const setLocalWishlist = (wishlist) => {
    try {
        localStorage.setItem('localWishlist', JSON.stringify(wishlist));
    } catch (e) {
        console.error('Error saving local wishlist', e);
    }
};

export const addToLocalWishlist = (product) => {
    const wishlist = getLocalWishlist();
    const exists = wishlist.some(item => {
        const id = item.productId?._id || item.productId;
        return id === product._id;
    });

    if (!exists) {
        wishlist.push({
            productId: product,
            _id: product._id
        });
        setLocalWishlist(wishlist);
    }
    return wishlist;
};

export const removeFromLocalWishlist = (productId) => {
    let wishlist = getLocalWishlist();
    wishlist = wishlist.filter(item => {
        const id = item.productId?._id || item.productId;
        return id !== productId;
    });
    setLocalWishlist(wishlist);
    return wishlist;
};

export const clearLocalWishlist = () => {
    try {
        localStorage.removeItem('localWishlist');
    } catch (e) {
        console.error('Error clearing local wishlist', e);
    }
};


// --- SYNC METHOD ---

export const syncLocalDataWithServer = async () => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        // Sync Cart items
        const localCart = getLocalCart();
        if (localCart.length > 0) {
            const itemsToSync = localCart.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity
            }));
            await API.post('/cart/sync', { items: itemsToSync });
            clearLocalCart();
        }

        // Sync Wishlist items
        const localWishlist = getLocalWishlist();
        if (localWishlist.length > 0) {
            const productIdsToSync = localWishlist.map(item => item.productId?._id || item.productId);
            await API.post('/wishlist/sync', { productIds: productIdsToSync });
            clearLocalWishlist();
        }

        // Dispatch final update event
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
        console.error('Error syncing local cart/wishlist data with server:', e);
    }
};
