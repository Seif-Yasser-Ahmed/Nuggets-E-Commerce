// src/services/cartService.js
import API from './api';

export const addToCart = (cartItemData) => {
    return API.post('/cart', cartItemData);
};

export const getCart = (userId) => {
    return API.get(`/cart/${userId}`);
};

export const updateCartItem = (cartItemId, updateData) => {
    return API.put(`/cart/${cartItemId}`, updateData);
};

export const removeCartItem = (cartItemId) => {
    return API.delete(`/cart/${cartItemId}`);
};
