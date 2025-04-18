const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middlewares/authMiddleware');
const {
    create,
    getById,
    getByUser,
    getAll,
    updateStatus,
    getByStatus,
    getStats,
    delete: deleteOrder
} = require('../controllers/orderController');

// Customer routes (requires authentication)
router.post('/', authenticateToken, create);
router.get('/user/:userId', authenticateToken, getByUser);

// Admin routes
router.get('/', authenticateAdmin, getAll);
router.get('/stats', authenticateAdmin, getStats);
router.get('/status/:status', authenticateAdmin, getByStatus);
router.get('/:id', authenticateAdmin, getById);
router.put('/:id/status', authenticateAdmin, updateStatus);
router.delete('/:id', authenticateAdmin, deleteOrder);

module.exports = router;