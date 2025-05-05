const {
    createProduct,
    getProductById,
    getAllProducts,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
    getCategories,
    getLowStock
} = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a new product
exports.create = (req, res) => {
    const productData = req.body;

    createProduct(productData, (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ success: false, error: 'Error creating product' });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            id: result.insertId
        });
    });
};

// Get a single product by ID
exports.getById = (req, res) => {
    const productId = req.params.id;

    getProductById(productId, (err, results) => {
        if (err) {
            console.error('Error retrieving product:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Parse JSON strings
        const product = results[0];
        // Parse specs if stored as JSON string
        if (product.specs && typeof product.specs === 'string') {
            try {
                product.specs = JSON.parse(product.specs);
            } catch (e) {
                console.error('Error parsing product specs:', e);
                product.specs = {};
            }
        }

        // Parse colors if stored as JSON string
        if (product.colors && typeof product.colors === 'string') {
            try {
                product.colors = JSON.parse(product.colors);
            } catch (e) {
                console.error('Error parsing product colors:', e);
                product.colors = [];
            }
        }

        // Parse sizes if stored as JSON string
        if (product.sizes && typeof product.sizes === 'string') {
            try {
                product.sizes = JSON.parse(product.sizes);
            } catch (e) {
                console.error('Error parsing product sizes:', e);
                product.sizes = [];
            }
        }

        res.status(200).json({ success: true, data: product });
    });
};

// Get all products
exports.getAll = (req, res) => {
    getAllProducts((err, results) => {
        if (err) {
            console.error('Error retrieving products:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving products' });
        }

        // Parse JSON strings for all products
        const products = results.map(product => {
            // Parse specs if stored as JSON string
            if (product.specs && typeof product.specs === 'string') {
                try {
                    product.specs = JSON.parse(product.specs);
                } catch (e) {
                    console.error(`Error parsing specs for product ${product.id}:`, e);
                    product.specs = {};
                }
            }

            // Parse colors if stored as JSON string
            if (product.colors && typeof product.colors === 'string') {
                try {
                    product.colors = JSON.parse(product.colors);
                } catch (e) {
                    console.error(`Error parsing colors for product ${product.id}:`, e);
                    product.colors = [];
                }
            }

            // Parse sizes if stored as JSON string
            if (product.sizes && typeof product.sizes === 'string') {
                try {
                    product.sizes = JSON.parse(product.sizes);
                } catch (e) {
                    console.error(`Error parsing sizes for product ${product.id}:`, e);
                    product.sizes = [];
                }
            }

            return product;
        });

        res.status(200).json({ success: true, data: products });
    });
};

// Get products by category
exports.getByCategory = (req, res) => {
    const category = req.params.category;

    getProductsByCategory(category, (err, results) => {
        if (err) {
            console.error('Error retrieving products by category:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving products by category' });
        }

        // Parse JSON strings
        const products = results.map(product => {
            // Parse specs if stored as JSON string
            if (product.specs && typeof product.specs === 'string') {
                try {
                    product.specs = JSON.parse(product.specs);
                } catch (e) {
                    console.error(`Error parsing specs for product ${product.id}:`, e);
                    product.specs = {};
                }
            }

            // Parse colors if stored as JSON string
            if (product.colors && typeof product.colors === 'string') {
                try {
                    product.colors = JSON.parse(product.colors);
                } catch (e) {
                    console.error(`Error parsing colors for product ${product.id}:`, e);
                    product.colors = [];
                }
            }

            // Parse sizes if stored as JSON string
            if (product.sizes && typeof product.sizes === 'string') {
                try {
                    product.sizes = JSON.parse(product.sizes);
                } catch (e) {
                    console.error(`Error parsing sizes for product ${product.id}:`, e);
                    product.sizes = [];
                }
            }

            return product;
        });

        res.status(200).json({ success: true, data: products });
    });
};

// Update a product
exports.update = (req, res) => {
    const productId = req.params.id;
    const productData = req.body;

    updateProduct(productId, productData, (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ success: false, error: 'Error updating product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product updated successfully' });
    });
};

// Delete a product
exports.delete = (req, res) => {
    const productId = req.params.id;

    deleteProduct(productId, (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ success: false, error: 'Error deleting product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    });
};

// Get all unique categories
exports.getCategories = (req, res) => {
    getCategories((err, results) => {
        if (err) {
            console.error('Error retrieving categories:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving categories' });
        }

        // Extract category names from results
        const categories = results.map(row => row.category);

        res.status(200).json({ success: true, data: categories });
    });
};

// Get products with low stock
exports.getLowStock = (req, res) => {
    // Default threshold of 10 if not specified
    const threshold = req.query.threshold || 10;

    getLowStock(threshold, (err, results) => {
        if (err) {
            console.error('Error retrieving low stock products:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving low stock products' });
        }

        // Parse JSON strings
        const products = results.map(product => {
            // Parse specs if stored as JSON string
            if (product.specs && typeof product.specs === 'string') {
                try {
                    product.specs = JSON.parse(product.specs);
                } catch (e) {
                    console.error(`Error parsing specs for product ${product.id}:`, e);
                    product.specs = {};
                }
            }

            // Parse colors if stored as JSON string
            if (product.colors && typeof product.colors === 'string') {
                try {
                    product.colors = JSON.parse(product.colors);
                } catch (e) {
                    console.error(`Error parsing colors for product ${product.id}:`, e);
                    product.colors = [];
                }
            }

            // Parse sizes if stored as JSON string
            if (product.sizes && typeof product.sizes === 'string') {
                try {
                    product.sizes = JSON.parse(product.sizes);
                } catch (e) {
                    console.error(`Error parsing sizes for product ${product.id}:`, e);
                    product.sizes = [];
                }
            }

            return product;
        });

        res.status(200).json({ success: true, data: products });
    });
};

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
        const extension = path.extname(file.originalname);
        cb(null, `product_${uniqueSuffix}${extension}`);
    }
});

// Configure multer for product image uploads
const productImageUpload = multer({
    storage: productImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)!'));
    }
}).single('image');

// Handle product image uploads
exports.uploadImage = (req, res) => {
    productImageUpload(req, res, function (err) {
        if (err) {
            console.error('Error uploading product image:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        // Log the uploaded file details
        console.log('Received file:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            path: req.file.path
        });

        // Create relative URL for the image (will be served from uploads directory)
        const imageUrl = `/uploads/products/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    });
};