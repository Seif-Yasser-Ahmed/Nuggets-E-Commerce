// src/services/cartService.js
import API, { formatId, isValidObjectId } from './api';

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
    const { userId, productId, quantity = 1, size, color } = cartItemData;

    // If userId exists, user is logged in - try to use API
    if (userId) {
        try {
            // Format IDs to ensure they're compatible with MongoDB
            const formattedUserId = formatId(userId);
            const formattedProductId = formatId(productId);

            // Make sure we have valid IDs before making the request
            if (!formattedUserId || !formattedProductId) {
                console.error('Invalid userId or productId format');
                return Promise.reject(new Error('Invalid ID format'));
            }

            // Send request with properly formatted IDs
            return await API.post('/cart', {
                userId: formattedUserId,
                productId: formattedProductId,
                quantity,
                ...(size && { size }),
                ...(color && { color })
            });
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
    const existingItemIndex = guestCart.findIndex(item => String(item.productId) === String(productId));

    if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        guestCart[existingItemIndex].quantity += quantity;

        // Update variants if provided
        if (size) guestCart[existingItemIndex].size = size;
        if (color) guestCart[existingItemIndex].color = color;
    } else {
        // Add new item with all attributes
        const newItem = { productId, quantity };
        if (size) newItem.size = size;
        if (color) newItem.color = color;
        guestCart.push(newItem);
    }

    saveGuestCart(guestCart);
    return Promise.resolve({ success: true, message: 'Added to guest cart' });
};

// Get user's cart (from API or local storage)
export const getCart = async (userId) => {
    if (userId) {
        try {
            const formattedUserId = formatId(userId);

            if (!formattedUserId) {
                return Promise.reject(new Error('Invalid user ID format'));
            }

            const response = await API.get(`/cart/${formattedUserId}`);
            console.log('Cart API response:', response);

            // Return the response as is - we'll handle different structures in the component
            return response;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
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
        const formattedUserId = formatId(userId);

        if (!formattedUserId) {
            return { success: false, error: 'Invalid user ID format' };
        }

        // Send all guest cart items to be added to the user's cart
        const promises = guestCart.map(item => {
            const formattedProductId = formatId(item.productId);

            if (!formattedProductId) {
                console.warn(`Skipping item with invalid product ID: ${item.productId}`);
                return Promise.resolve();
            }

            return API.post('/cart', {
                userId: formattedUserId,
                productId: formattedProductId,
                quantity: item.quantity,
                ...(item.size && { size: item.size }),
                ...(item.color && { color: item.color })
            });
        }).filter(Boolean); // Remove any undefined promises

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
    // Handle guest cart items (they start with "guest-")
    if (cartItemId && typeof cartItemId === 'string' && cartItemId.startsWith('guest-')) {
        return Promise.resolve({ success: true, message: 'Updated guest cart item' });
    }

    // Otherwise, update on server
    const formattedItemId = formatId(cartItemId);

    if (!formattedItemId || !isValidObjectId(formattedItemId)) {
        return Promise.reject(new Error('Invalid cart item ID format'));
    }

    return API.put(`/cart/${formattedItemId}`, updateData);
};

// Remove cart item
export const removeCartItem = (cartItemId) => {
    // Handle guest cart items (they start with "guest-")
    if (cartItemId && typeof cartItemId === 'string' && cartItemId.startsWith('guest-')) {
        return Promise.resolve({ success: true, message: 'Removed guest cart item' });
    }

    // Otherwise, remove from server
    const formattedItemId = formatId(cartItemId);

    if (!formattedItemId || !isValidObjectId(formattedItemId)) {
        return Promise.reject(new Error('Invalid cart item ID format'));
    }

    return API.delete(`/cart/${formattedItemId}`);
};

// Get cart item count
export const getCartCount = async (userId) => {
    if (!userId) {
        // For guest users, count items in local storage
        const guestCart = getGuestCart();
        const count = guestCart.reduce((total, item) => total + (item.quantity || 1), 0);
        return Promise.resolve({ success: true, data: { count } });
    }

    try {
        const formattedUserId = formatId(userId);

        if (!formattedUserId || !isValidObjectId(formattedUserId)) {
            console.warn(`Invalid user ID format for getCartCount: ${userId}`);
            return Promise.resolve({ success: true, data: { count: 0 } });
        }

        const response = await API.get(`/cart/count/${formattedUserId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching cart count:', error);
        return { success: true, data: { count: 0 } };  // Fallback to 0 on error
    }
};
