// src/services/userService.js
import axios from 'axios';

// Base API endpoints for different resources
const USER_API_URL = 'http://localhost:5000/api/v1/users';
const PRODUCT_API_URL = 'http://localhost:5000/api/v1/products';
const CART_API_URL = 'http://localhost:5000/api/v1/cart';
const CHECKOUT_API_URL = 'http://localhost:5000/api/v1/checkout';
const ORDER_API_URL = 'http://localhost:5000/api/v1/orders';
const INVENTORY_API_URL = 'http://localhost:5000/api/v1/inventory';
const SHIPPING_TAX_API_URL = 'http://localhost:5000/api/v1/shipping';  // Endpoint for shipping & tax calculations
const PROMOTION_API_URL = 'http://localhost:5000/api/v1/promotions';

// -------------------------------------------------
// 1. User Registration and Authentication
// -------------------------------------------------
export const signup = (userData) => {
    return axios.post(`${USER_API_URL}/signup`, userData);
};

export const signin = (credentials) => {
    return axios.post(`${USER_API_URL}/signin`, credentials);
};

export const getProfile = (userId) => {
    return axios.get(`${USER_API_URL}/profile/${userId}`);
};

// -------------------------------------------------
// 2. Product Catalog Management
// -------------------------------------------------
export const getProducts = () => {
    return axios.get(`${PRODUCT_API_URL}`);
};

export const getProductById = (productId) => {
    return axios.get(`${PRODUCT_API_URL}/${productId}`);
};

export const addProduct = (productData) => {
    return axios.post(`${PRODUCT_API_URL}`, productData);
};

export const updateProduct = (productId, productData) => {
    return axios.put(`${PRODUCT_API_URL}/${productId}`, productData);
};

export const deleteProduct = (productId) => {
    return axios.delete(`${PRODUCT_API_URL}/${productId}`);
};

// -------------------------------------------------
// 3. Shopping Cart
// -------------------------------------------------
export const addToCart = (cartItemData) => {
    return axios.post(`${CART_API_URL}`, cartItemData);
};

export const getCart = (userId) => {
    return axios.get(`${CART_API_URL}/${userId}`);
};

export const updateCartItem = (cartItemId, updateData) => {
    return axios.put(`${CART_API_URL}/${cartItemId}`, updateData);
};

export const removeCartItem = (cartItemId) => {
    return axios.delete(`${CART_API_URL}/${cartItemId}`);
};

// -------------------------------------------------
// 4. Checkout Process
// -------------------------------------------------
export const checkout = (checkoutData) => {
    return axios.post(`${CHECKOUT_API_URL}`, checkoutData);
};

// -------------------------------------------------
// 5. Order Management
// -------------------------------------------------
export const getOrders = (userId) => {
    return axios.get(`${ORDER_API_URL}?userId=${userId}`);
};

export const updateOrderStatus = (orderId, statusData) => {
    return axios.put(`${ORDER_API_URL}/${orderId}`, statusData);
};

export const cancelOrder = (orderId) => {
    return axios.delete(`${ORDER_API_URL}/${orderId}`);
};

export const issueRefund = (orderId, refundData) => {
    return axios.post(`${ORDER_API_URL}/${orderId}/refund`, refundData);
};

// -------------------------------------------------
// 6. Inventory Management
// -------------------------------------------------
export const getInventory = () => {
    return axios.get(`${INVENTORY_API_URL}`);
};

export const updateInventory = (productId, inventoryData) => {
    return axios.put(`${INVENTORY_API_URL}/${productId}`, inventoryData);
};

export const getLowStockAlerts = () => {
    return axios.get(`${INVENTORY_API_URL}/low-stock`);
};

// -------------------------------------------------
// 7. Shipping and Tax Calculation
// -------------------------------------------------
export const calculateShippingTax = (cartData, location) => {
    // Expected to return calculated shipping cost and tax based on cart items and user location
    return axios.post(`${SHIPPING_TAX_API_URL}/tax`, { cartData, location });
};

// -------------------------------------------------
// 8. Search and Filter Functionality for Products
// -------------------------------------------------
export const searchProducts = (query) => {
    return axios.get(`${PRODUCT_API_URL}/search`, { params: { query } });
};

export const filterProducts = (filters) => {
    // `filters` can be an object like { priceRange: '10-50', category: 'books' }
    return axios.get(`${PRODUCT_API_URL}/filter`, { params: filters });
};

// -------------------------------------------------
// 9. Customer Reviews and Ratings
// -------------------------------------------------
export const addReview = (productId, reviewData) => {
    return axios.post(`${PRODUCT_API_URL}/${productId}/reviews`, reviewData);
};

export const getReviews = (productId) => {
    return axios.get(`${PRODUCT_API_URL}/${productId}/reviews`);
};

export const updateReview = (productId, reviewId, reviewData) => {
    return axios.put(`${PRODUCT_API_URL}/${productId}/reviews/${reviewId}`, reviewData);
};

export const deleteReview = (productId, reviewId) => {
    return axios.delete(`${PRODUCT_API_URL}/${productId}/reviews/${reviewId}`);
};

// -------------------------------------------------
// 10. Promotions and Discounts
// -------------------------------------------------
export const getPromotions = () => {
    return axios.get(`${PROMOTION_API_URL}`);
};

export const applyCoupon = (couponCode) => {
    return axios.post(`${PROMOTION_API_URL}/apply`, { couponCode });
};

export const createPromotion = (promotionData) => {
    return axios.post(`${PROMOTION_API_URL}`, promotionData);
};

export const updatePromotion = (promoId, promotionData) => {
    return axios.put(`${PROMOTION_API_URL}/${promoId}`, promotionData);
};

export const deletePromotion = (promoId) => {
    return axios.delete(`${PROMOTION_API_URL}/${promoId}`);
};
