const express = require('express');
const router = express.Router();
const { authenticateAdmin, authenticate } = require('../middlewares/authMiddleware');
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
const {
    getProductReviews,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

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

// Review routes
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, addReview);
router.put('/:productId/reviews/:reviewId', authenticate, updateReview);
router.delete('/:productId/reviews/:reviewId', authenticate, deleteReview);

module.exports = router;