const express = require('express');
const router = express.Router();
const { authenticateAdmin, authenticate } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup storage for product image uploads
const productImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/products');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product_' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: productImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

const {
    create,
    getById,
    getAll,
    getByCategory,
    update,
    delete: deleteProduct,
    getCategories,
    getLowStock,
    uploadImage,
    uploadMultipleImages
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
router.post('/', authenticateAdmin, upload.array('images', 5), create);
router.post('/upload-image', authenticateAdmin, uploadImage);
router.post('/upload-images', authenticateAdmin, uploadMultipleImages);
router.put('/:id', authenticateAdmin, upload.array('images', 5), update);
router.delete('/:id', authenticateAdmin, deleteProduct);
router.get('/inventory/low-stock', authenticateAdmin, getLowStock);

// Review routes
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, addReview);
router.put('/:productId/reviews/:reviewId', authenticate, updateReview);
router.delete('/:productId/reviews/:reviewId', authenticate, deleteReview);

module.exports = router;