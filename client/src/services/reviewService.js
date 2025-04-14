// src/services/reviewService.js
import API from './api';

export const addReview = (productId, reviewData) => {
    return API.post(`/products/${productId}/reviews`, reviewData);
};

export const getReviews = (productId) => {
    return API.get(`/products/${productId}/reviews`);
};

export const updateReview = (productId, reviewId, reviewData) => {
    return API.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
};

export const deleteReview = (productId, reviewId) => {
    return API.delete(`/products/${productId}/reviews/${reviewId}`);
};
