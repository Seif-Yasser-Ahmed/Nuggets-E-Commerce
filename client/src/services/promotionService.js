// src/services/promotionService.js
import API from './api';

export const getPromotions = () => {
    return API.get('/promotions');
};

export const applyCoupon = (couponCode) => {
    return API.post('/promotions/apply', { couponCode });
};

export const createPromotion = (promotionData) => {
    return API.post('/promotions', promotionData);
};

export const updatePromotion = (promoId, promotionData) => {
    return API.put(`/promotions/${promoId}`, promotionData);
};

export const deletePromotion = (promoId) => {
    return API.delete(`/promotions/${promoId}`);
};
