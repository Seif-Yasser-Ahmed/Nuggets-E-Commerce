// src/services/shippingService.js
import API from './api';

export const calculateShippingTax = (cartData, location) => {
    return API.post('/shipping/tax', { cartData, location });
};
