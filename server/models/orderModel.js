const db = require('../db');

module.exports = {
    createOrder: (order, callback) => {
        const { user_id, total_amount, shipping_address, payment_method, status } = order;
        const query = `
            INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        db.query(query, [user_id, total_amount, JSON.stringify(shipping_address), payment_method, status], callback);
    },

    addOrderItem: (orderItem, callback) => {
        const { order_id, product_id, quantity, price } = orderItem;
        const query = `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `;
        db.query(query, [order_id, product_id, quantity, price], callback);
    },

    getOrderById: (id, callback) => {
        const query = `
            SELECT o.*, u.username, u.email 
            FROM orders o
            JOIN user u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        db.query(query, [id], callback);
    },

    getOrderItems: (orderId, callback) => {
        const query = `
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN product p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        db.query(query, [orderId], callback);
    },

    getOrdersByUser: (userId, callback) => {
        const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
        db.query(query, [userId], callback);
    },

    getAllOrders: (callback) => {
        const query = `
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN user u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        db.query(query, callback);
    },

    updateOrderStatus: (id, status, callback) => {
        const query = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
        db.query(query, [status, id], callback);
    },

    getOrdersByStatus: (status, callback) => {
        const query = `
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN user u ON o.user_id = u.id
            WHERE o.status = ?
            ORDER BY o.created_at DESC
        `;
        db.query(query, [status], callback);
    },

    getOrderStats: (callback) => {
        const query = `
            SELECT 
                status, 
                COUNT(*) as count,
                SUM(total_amount) as total
            FROM orders
            GROUP BY status
        `;
        db.query(query, callback);
    },

    deleteOrder: (id, callback) => {
        // First delete related order items
        const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
        db.query(deleteItemsQuery, [id], (err) => {
            if (err) return callback(err);

            // Then delete the order
            const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
            db.query(deleteOrderQuery, [id], callback);
        });
    }
};