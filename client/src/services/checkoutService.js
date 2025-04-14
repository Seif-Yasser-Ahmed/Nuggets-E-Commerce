// src/services/checkoutService.js
import API from './api';

export const checkout = (checkoutData) => {
    return API.post('/checkout', checkoutData);
};
