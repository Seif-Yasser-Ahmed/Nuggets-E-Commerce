// src/services/orderService.js
import API from './api';

export const getOrders = (userId) => {
    return API.get(`/orders?userId=${userId}`);
};

export const updateOrderStatus = (orderId, statusData) => {
    return API.put(`/orders/${orderId}`, statusData);
};

export const cancelOrder = (orderId) => {
    return API.delete(`/orders/${orderId}`);
};

export const issueRefund = (orderId, refundData) => {
    return API.post(`/orders/${orderId}/refund`, refundData);
};
