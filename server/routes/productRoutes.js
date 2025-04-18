const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const {
    create,
    getById,
    getAll,
    getByCategory,
    update,
    delete: deleteProduct,
    getCategories,
    getLowStock
} = require('../controllers/productController');

// Public routes
router.get('/', getAll);
router.get('/categories', getCategories);
router.get('/category/:category', getByCategory);
router.get('/:id', getById);

// Admin-only routes
router.post('/', authenticateAdmin, create);
router.put('/:id', authenticateAdmin, update);
router.delete('/:id', authenticateAdmin, deleteProduct);
router.get('/inventory/low-stock', authenticateAdmin, getLowStock);

module.exports = router;