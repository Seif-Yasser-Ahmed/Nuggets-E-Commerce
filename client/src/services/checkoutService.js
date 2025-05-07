// src/services/checkoutService.js
import API from './api';

export const checkout = (checkoutData) => {
    // Restructure data to match what the server expects
    const formattedData = {
        userId: checkoutData.order.user_id,
        items: checkoutData.orderItems.map(item => ({
            product: item.product_id,
            quantity: item.quantity,
            price: item.price,
            name: item.name || ''
        })),
        totalAmount: checkoutData.order.total_amount,
        shippingAddress: checkoutData.order.shipping_address,
        paymentMethod: checkoutData.order.payment_method
    };

    return API.post('/orders', formattedData);
};
