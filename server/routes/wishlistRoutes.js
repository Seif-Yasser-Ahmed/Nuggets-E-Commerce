const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// Wishlist routes - make GET public but POST and DELETE still require authentication
router.get('/:userId', wishlistController.getWishlist);
router.post('/', authenticateToken, wishlistController.addToWishlist);
router.delete('/:userId/:productId', authenticateToken, wishlistController.removeFromWishlist);

module.exports = router;