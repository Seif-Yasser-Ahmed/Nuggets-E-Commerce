import api, { formatId, isValidObjectId } from './api';

// Helper function to update local wishlist cache
const updateLocalWishlistCache = (productId, isAdding) => {
    try {
        const wishlistCache = JSON.parse(localStorage.getItem('userWishlist') || '{"items":[]}');

        if (isAdding && !wishlistCache.items.includes(productId)) {
            wishlistCache.items.push(productId);
        } else if (!isAdding) {
            wishlistCache.items = wishlistCache.items.filter(id => id !== productId);
        }

        localStorage.setItem('userWishlist', JSON.stringify(wishlistCache));
    } catch (error) {
        console.error('Error updating wishlist cache:', error);
    }
};

// Get user's wishlist
export const getWishlist = async (userId) => {
    try {
        if (!userId) {
            console.error('Invalid userId: userId is required');
            return { success: false, data: [] };
        }

        const formattedId = formatId(userId);
        if (!formattedId) {
            console.error('Invalid userId format for wishlist');
            return { success: false, data: [] };
        }

        const response = await api.get(`/wishlist/${formattedId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

// Add product to wishlist - supports both parameter formats for compatibility
export const addToWishlist = async (userIdOrData, productIdParam) => {
    try {
        // Handle both function signatures:
        // 1. addToWishlist(userId, productId)
        // 2. addToWishlist({userId, productId})
        let userId, productId;

        if (typeof userIdOrData === 'object' && userIdOrData !== null && 'userId' in userIdOrData) {
            // Called with object parameter
            userId = userIdOrData.userId;
            productId = userIdOrData.productId;
        } else {
            // In Item.js, we're now consistently using (userId, productId)
            userId = userIdOrData;
            productId = productIdParam;
        }

        // Make sure we have non-empty values to work with
        if (!userId || !productId) {
            console.error('Invalid parameters: both userId and productId are required');
            return Promise.reject(new Error('Both userId and productId are required'));
        }

        const formattedUserId = formatId(userId);
        const formattedProductId = formatId(productId);

        // Check if we have valid formatted IDs before proceeding
        if (!formattedUserId || !formattedProductId) {
            console.error('Invalid MongoDB ObjectID format for userId or productId');
            return Promise.reject(new Error('Invalid ID format'));
        } const response = await api.post('/wishlist', {
            userId: formattedUserId,
            productId: formattedProductId
        });

        // Update local cache
        updateLocalWishlistCache(formattedProductId, true);

        return response.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

// Remove product from wishlist - supports both parameter formats
export const removeFromWishlist = async (userIdOrData, productIdParam) => {
    try {
        // Handle both possible function signatures for compatibility
        let userId, productId;

        if (typeof userIdOrData === 'object' && userIdOrData !== null && 'userId' in userIdOrData && productIdParam === undefined) {
            // Called with object parameter
            userId = userIdOrData.userId;
            productId = userIdOrData.productId;
        } else {
            // Called with separate parameters
            userId = userIdOrData;
            productId = productIdParam;
        }

        // Make sure we have non-empty values to work with
        if (!userId || !productId) {
            console.error('Invalid parameters: both userId and productId are required');
            return Promise.reject(new Error('Both userId and productId are required'));
        }

        const formattedUserId = formatId(userId);
        const formattedProductId = formatId(productId);

        // Check if we have valid formatted IDs before proceeding
        if (!formattedUserId || !formattedProductId) {
            console.error('Invalid MongoDB ObjectID format for userId or productId');
            return Promise.reject(new Error('Invalid ID format'));
        } const response = await api.delete(`/wishlist/${formattedUserId}/${formattedProductId}`);

        // Update local cache
        updateLocalWishlistCache(formattedProductId, false);

        return response.data;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};