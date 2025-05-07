const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middlewares/authMiddleware');
const {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    getRecentOrders,
    getOrderStats
} = require('../controllers/orderController');

// Customer routes (requires authentication)
router.post('/', authenticateToken, createOrder);
router.get('/user/:userId', authenticateToken, getUserOrders);

// Admin routes
router.get('/', authenticateAdmin, getAllOrders);
router.get('/recent', authenticateAdmin, getRecentOrders);
router.get('/stats', authenticateAdmin, getOrderStats);
router.get('/:orderId', authenticateToken, getOrderById);
router.put('/:orderId/status', authenticateAdmin, updateOrderStatus);

module.exports = router;