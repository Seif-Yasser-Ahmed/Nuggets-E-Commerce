const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a new product
exports.create = async (req, res) => {
    try {
        const productData = req.body;
        const files = req.files;

        console.log('Creating product with data:', JSON.stringify(productData, null, 2));
        console.log('Files received:', files ? files.length : 0);

        // Enhanced check for required fields
        const requiredFields = ['name', 'price', 'category', 'description'];
        const missingFields = requiredFields.filter(field => {
            // Check if the field exists and has a non-empty value (0 is valid for price)
            const fieldValue = productData[field];
            const isMissing = fieldValue === undefined || fieldValue === null ||
                (fieldValue === '' && field !== 'price');

            if (isMissing) {
                console.log(`Missing field: ${field}`);
            }

            return isMissing;
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Parse JSON strings from form data
        if (productData.specs && typeof productData.specs === 'string') {
            try {
                productData.specs = JSON.parse(productData.specs);
            } catch (e) {
                console.error('Error parsing specs JSON:', e);
                productData.specs = {};
            }
        }

        if (productData.colors && typeof productData.colors === 'string') {
            try {
                productData.colors = JSON.parse(productData.colors);
            } catch (e) {
                console.error('Error parsing colors JSON:', e);
                productData.colors = [];
            }
        }

        if (productData.sizes && typeof productData.sizes === 'string') {
            try {
                productData.sizes = JSON.parse(productData.sizes);
            } catch (e) {
                console.error('Error parsing sizes JSON:', e);
                productData.sizes = [];
            }
        }

        // Handle uploaded images
        if (files && files.length > 0) {
            // Create URLs for all uploaded files
            productData.images = files.map(file => `/uploads/products/${file.filename}`);
            // Set the first image as the main image
            productData.image_url = productData.images[0];
        }
        // If no files but existingImages are provided (during edit)
        else if (productData.existingImages && typeof productData.existingImages === 'string') {
            try {
                const existingImages = JSON.parse(productData.existingImages);
                productData.images = existingImages;
                if (existingImages.length > 0) {
                    productData.image_url = existingImages[0];
                }
                delete productData.existingImages; // Remove the temporary field
            } catch (e) {
                console.error('Error parsing existingImages JSON:', e);
            }
        }
        // No images provided
        else if (!productData.image_url && (!productData.images || productData.images.length === 0)) {
            return res.status(400).json({
                success: false,
                error: 'At least one product image is required'
            });
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            id: newProduct._id
        });
    } catch (err) {
        console.error('Error creating product:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ success: false, error: 'Error creating product' });
    }
};

// Get a single product by ID
exports.getById = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validate the product ID - more comprehensive validation
        if (!productId || productId === 'undefined' || productId === 'null') {
            console.error('Invalid product ID requested:', productId);
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid product ID',
                message: 'A valid product ID is required'
            });
        }
        
        // Check if the ID is a valid MongoDB ObjectId
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid product ID format:', productId);
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid product ID format',
                message: 'The product ID must be a valid MongoDB ObjectId'
            });
        }
        
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        console.error('Error retrieving product:', err);
        
        // Check for invalid ObjectId error
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format',
                message: `The provided ID "${req.params.id}" is not a valid MongoDB ObjectId`
            });
        }
        
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
        const files = req.files;

        // Enhanced check for required fields for update
        const requiredFields = ['name', 'price', 'category', 'description'];
        const missingFields = requiredFields.filter(field =>
            productData.hasOwnProperty(field) && !productData[field] && productData[field] !== 0
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Parse JSON strings from form data
        if (productData.specs && typeof productData.specs === 'string') {
            try {
                productData.specs = JSON.parse(productData.specs);
            } catch (e) {
                console.error('Error parsing specs JSON:', e);
                productData.specs = {};
            }
        }

        if (productData.colors && typeof productData.colors === 'string') {
            try {
                productData.colors = JSON.parse(productData.colors);
            } catch (e) {
                console.error('Error parsing colors JSON:', e);
                productData.colors = [];
            }
        }

        if (productData.sizes && typeof productData.sizes === 'string') {
            try {
                productData.sizes = JSON.parse(productData.sizes);
            } catch (e) {
                console.error('Error parsing sizes JSON:', e);
                productData.sizes = [];
            }
        }

        // Handle uploaded images
        if (files && files.length > 0) {
            // Create URLs for all uploaded files
            productData.images = files.map(file => `/uploads/products/${file.filename}`);
            // Set the first image as the main image
            productData.image_url = productData.images[0];
        }
        // If no files but existingImages are provided (during edit)
        else if (productData.existingImages && typeof productData.existingImages === 'string') {
            try {
                const existingImages = JSON.parse(productData.existingImages);
                productData.images = existingImages;
                if (existingImages.length > 0) {
                    productData.image_url = existingImages[0];
                }
                delete productData.existingImages; // Remove the temporary field
            } catch (e) {
                console.error('Error parsing existingImages JSON:', e);
            }
        }
        // Check that we have at least one image
        else if (productData.hasOwnProperty('images') && (!productData.images || productData.images.length === 0) && !productData.image_url) {
            return res.status(400).json({
                success: false,
                error: 'At least one product image is required'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (err) {
        console.error('Error updating product:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ success: false, error: 'Error updating product' });
    }
};

// Delete a product
exports.delete = async (req, res) => {
    try {
        const productId = req.params.id;

        // Validate the ID before attempting to use it
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Missing product ID',
                message: 'Product ID is required to delete a product'
            });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);

        // Check for invalid ObjectId error
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format',
                message: `The provided ID "${req.params.id}" is not a valid MongoDB ObjectId`
            });
        }

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
});

// Single image upload handler
const singleUpload = upload.single('image');

// Upload single product image
exports.uploadImage = (req, res) => {
    singleUpload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Create the URL for the uploaded file
        const filePath = `/uploads/products/${req.file.filename}`;
        res.status(200).json({ success: true, imageUrl: filePath });
    });
};

// Multiple images upload handler (up to 5 images)
const multipleUpload = upload.array('images', 5);

// Upload multiple product images
exports.uploadMultipleImages = (req, res) => {
    multipleUpload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        // Create URLs for all uploaded files
        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);

        res.status(200).json({
            success: true,
            imageUrls: imagePaths,
            mainImageUrl: imagePaths[0] // Set the first image as the main image
        });
    });
};