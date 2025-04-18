const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');

// Cart routes
router.get('/:userId', authenticateToken, cartController.getCart);
router.get('/count/:userId', authenticateToken, cartController.getCartCount);
router.post('/', authenticateToken, cartController.addToCart);
router.put('/:cartItemId', authenticateToken, cartController.updateCartItem);
router.delete('/:cartItemId', authenticateToken, cartController.removeCartItem);

module.exports = router;