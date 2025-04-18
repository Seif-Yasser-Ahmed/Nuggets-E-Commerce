// src/services/cartService.js
import API from './api';

// Key for storing guest cart in local storage
const GUEST_CART_KEY = 'guest_cart_items';

// Get cart items from local storage for guest users
export const getGuestCart = () => {
    try {
        const cartItems = localStorage.getItem(GUEST_CART_KEY);
        return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
        console.error('Error getting guest cart from local storage:', error);
        return [];
    }
};

// Save cart items to local storage for guest users
export const saveGuestCart = (cartItems) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.error('Error saving guest cart to local storage:', error);
    }
};

// Add product to cart (handles both logged in and guest users)
export const addToCart = async (cartItemData) => {
    const { userId, productId, quantity } = cartItemData;

    // If userId exists, user is logged in - try to use API
    if (userId) {
        try {
            return await API.post('/cart', cartItemData);
        } catch (error) {
            // If we get an auth error (token expired), fall back to guest cart
            if (error.response &&
                (error.response.status === 401 ||
                    (error.response.status === 403 && error.response.data?.message === 'Invalid or expired token'))) {

                console.log('Auth error when adding to cart, falling back to guest cart');
                // Continue with guest cart logic below
            } else {
                // For other errors, propagate them up
                throw error;
            }
        }
    }

    // For guests or fallback due to auth error
    const guestCart = getGuestCart();
    const existingItemIndex = guestCart.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        guestCart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        guestCart.push({ productId, quantity });
    }

    saveGuestCart(guestCart);
    return Promise.resolve({ success: true, message: 'Added to guest cart' });
};

// Get user's cart (from API or local storage)
export const getCart = (userId) => {
    if (userId) {
        // Get from server for logged in users
        return API.get(`/cart/${userId}`);
    } else {
        // Get from local storage for guests
        const guestCartItems = getGuestCart();
        // Return in the same format as the API would
        return Promise.resolve({
            data: {
                success: true,
                data: guestCartItems,
                total: 0 // Can't calculate total without product prices
            }
        });
    }
};

// Merge guest cart with user cart on login
export const mergeGuestCartWithUserCart = async (userId) => {
    const guestCart = getGuestCart();

    if (!guestCart.length) {
        return { success: true, message: 'No guest cart items to merge' };
    }

    try {
        // Send all guest cart items to be added to the user's cart
        const promises = guestCart.map(item =>
            API.post('/cart', {
                userId,
                productId: item.productId,
                quantity: item.quantity
            })
        );

        await Promise.all(promises);

        // Clear guest cart after successful merge
        localStorage.removeItem(GUEST_CART_KEY);

        return { success: true, message: 'Guest cart merged successfully' };
    } catch (error) {
        console.error('Error merging guest cart:', error);
        return { success: false, error: 'Failed to merge cart items' };
    }
};

// Update cart item
export const updateCartItem = (cartItemId, updateData) => {
    return API.put(`/cart/${cartItemId}`, updateData);
};

// Remove cart item
export const removeCartItem = (cartItemId) => {
    return API.delete(`/cart/${cartItemId}`);
};
