const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a new product
exports.create = async (req, res) => {
    try {
        const productData = req.body;

        const newProduct = new Product(productData);
        await newProduct.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            id: newProduct._id
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ success: false, error: 'Error creating product' });
    }
};

// Get a single product by ID
exports.getById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        console.error('Error retrieving product:', err);
        res.status(500).json({ success: false, error: 'Error retrieving product' });
    }
};

// Get all products
exports.getAll = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error('Error retrieving products:', err);
        res.status(500).json({ success: false, error: 'Error retrieving products' });
    }
};

// Get products by category
exports.getByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ category });
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error('Error retrieving products by category:', err);
        res.status(500).json({ success: false, error: 'Error retrieving products by category' });
    }
};

// Update a product
exports.update = async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product updated successfully' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ success: false, error: 'Error updating product' });
    }
};

// Delete a product
exports.delete = async (req, res) => {
    try {
        const productId = req.params.id;

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, error: 'Error deleting product' });
    }
};

// Get all unique categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        console.error('Error retrieving categories:', err);
        res.status(500).json({ success: false, error: 'Error retrieving categories' });
    }
};

// Get products with low stock
exports.getLowStock = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const products = await Product.find({ stock: { $lte: threshold } });
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error('Error retrieving low stock products:', err);
        res.status(500).json({ success: false, error: 'Error retrieving low stock products' });
    }
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
}).single('image');

// Upload product image
exports.uploadImage = (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Create the URL for the uploaded file
        const filePath = `/uploads/products/${req.file.filename}`;
        res.status(200).json({ success: true, data: { image_url: filePath } });
    });
};