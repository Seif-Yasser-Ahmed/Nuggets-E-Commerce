const {
    createOrder,
    addOrderItem,
    getOrderById,
    getOrderItems,
    getOrdersByUser,
    getAllOrders,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStats,
    deleteOrder
} = require('../models/orderModel');

// Create a new order
exports.create = (req, res) => {
    const { order, orderItems } = req.body;

    // First, create the order
    createOrder(order, (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ success: false, error: 'Error creating order' });
        }

        // Get the new order ID
        const orderId = result.insertId;

        // If there are no order items, return success
        if (!orderItems || orderItems.length === 0) {
            return res.status(201).json({
                success: true,
                message: 'Order created successfully (no items)',
                orderId
            });
        }

        // Add each order item
        let addedItems = 0;
        const errors = [];

        orderItems.forEach(item => {
            const orderItem = {
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            };

            addOrderItem(orderItem, (err, result) => {
                // If error adding this item, store the error
                if (err) {
                    console.error('Error adding order item:', err);
                    errors.push(item.product_id);
                }

                addedItems++;

                // If all items have been processed, send the response
                if (addedItems === orderItems.length) {
                    if (errors.length > 0) {
                        return res.status(500).json({
                            success: false,
                            message: 'Order created but some items failed to add',
                            orderId,
                            errors
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Order and all items created successfully',
                        orderId
                    });
                }
            });
        });
    });
};

// Get an order by ID, including its items
exports.getById = (req, res) => {
    const orderId = req.params.id;

    // First get the order details
    getOrderById(orderId, (err, orderResults) => {
        if (err) {
            console.error('Error retrieving order:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving order' });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Parse shipping address if it's stored as a JSON string
        const order = orderResults[0];
        if (order.shipping_address && typeof order.shipping_address === 'string') {
            try {
                order.shipping_address = JSON.parse(order.shipping_address);
            } catch (e) {
                console.error('Error parsing shipping address:', e);
            }
        }

        // Then get the order items
        getOrderItems(orderId, (err, itemResults) => {
            if (err) {
                console.error('Error retrieving order items:', err);
                return res.status(500).json({ success: false, error: 'Error retrieving order items' });
            }

            // Combine order with its items
            order.items = itemResults;

            res.status(200).json({ success: true, data: order });
        });
    });
};

// Get orders for a specific user
exports.getByUser = (req, res) => {
    const userId = req.params.userId;

    getOrdersByUser(userId, (err, results) => {
        if (err) {
            console.error('Error retrieving user orders:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving user orders' });
        }

        // Parse shipping addresses
        const orders = results.map(order => {
            if (order.shipping_address && typeof order.shipping_address === 'string') {
                try {
                    order.shipping_address = JSON.parse(order.shipping_address);
                } catch (e) {
                    console.error(`Error parsing shipping address for order ${order.id}:`, e);
                }
            }
            return order;
        });

        res.status(200).json({ success: true, data: orders });
    });
};

// Get all orders (admin only)
exports.getAll = (req, res) => {
    getAllOrders((err, results) => {
        if (err) {
            console.error('Error retrieving orders:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving orders' });
        }

        // Parse shipping addresses
        const orders = results.map(order => {
            if (order.shipping_address && typeof order.shipping_address === 'string') {
                try {
                    order.shipping_address = JSON.parse(order.shipping_address);
                } catch (e) {
                    console.error(`Error parsing shipping address for order ${order.id}:`, e);
                }
            }
            return order;
        });

        res.status(200).json({ success: true, data: orders });
    });
};

// Update an order's status
exports.updateStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }

    updateOrderStatus(orderId, status, (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ success: false, error: 'Error updating order status' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, message: 'Order status updated successfully' });
    });
};

// Get orders by status
exports.getByStatus = (req, res) => {
    const status = req.params.status;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }

    getOrdersByStatus(status, (err, results) => {
        if (err) {
            console.error('Error retrieving orders by status:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving orders by status' });
        }

        // Parse shipping addresses
        const orders = results.map(order => {
            if (order.shipping_address && typeof order.shipping_address === 'string') {
                try {
                    order.shipping_address = JSON.parse(order.shipping_address);
                } catch (e) {
                    console.error(`Error parsing shipping address for order ${order.id}:`, e);
                }
            }
            return order;
        });

        res.status(200).json({ success: true, data: orders });
    });
};

// Get order statistics (admin only)
exports.getStats = (req, res) => {
    getOrderStats((err, results) => {
        if (err) {
            console.error('Error retrieving order statistics:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving order statistics' });
        }

        res.status(200).json({ success: true, data: results });
    });
};

// Delete an order (admin only)
exports.delete = (req, res) => {
    const orderId = req.params.id;

    deleteOrder(orderId, (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ success: false, error: 'Error deleting order' });
        }

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    });
};