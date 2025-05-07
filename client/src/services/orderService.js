// src/services/orderService.js
import API, { formatId } from './api';

// Create a new order
export const createOrder = async (orderData) => {
    try {
        // Format user ID to be compatible with MongoDB
        if (orderData.userId) {
            orderData.userId = formatId(orderData.userId);
        }

        // Format product IDs in order items
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items = orderData.items.map(item => ({
                ...item,
                product: formatId(item.product)
            }));
        }

        const response = await API.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Get all orders (admin)
export const getAllOrders = async () => {
    try {
        const response = await API.get('/orders/admin');
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

// Get user orders
export const getUserOrders = async (userId) => {
    try {
        const formattedId = formatId(userId);
        const response = await API.get(`/orders/user/${formattedId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

// Get order details
export const getOrderById = async (orderId) => {
    try {
        const formattedId = formatId(orderId);
        const response = await API.get(`/orders/${formattedId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw error;
    }
};

// Update order status (admin)
export const updateOrderStatus = async (orderId, status) => {
    try {
        const formattedId = formatId(orderId);
        const response = await API.put(`/orders/${formattedId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Get recent orders (admin)
export const getRecentOrders = async (limit = 10) => {
    try {
        const response = await API.get(`/orders/admin/recent?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error;
    }
};
