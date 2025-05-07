const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find wishlist and populate product details
        const wishlist = await Wishlist.findOne({ user: userId })
            .populate('products', 'name price image_url category');

        if (!wishlist) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: wishlist.products });
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        res.status(500).json({ success: false, error: 'Error retrieving wishlist' });
    }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, error: 'User ID and Product ID are required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            // Create new wishlist
            wishlist = new Wishlist({
                user: userId,
                products: [productId]
            });
        } else {
            // Check if product is already in wishlist - convert ObjectIds to strings for comparison
            const isProductInWishlist = wishlist.products.some(
                id => id.toString() === productId.toString()
            );

            if (!isProductInWishlist) {
                wishlist.products.push(productId);
            } else {
                return res.status(200).json({ success: true, message: 'Product already in wishlist' });
            }
        }

        await wishlist.save();
        res.status(200).json({ success: true, message: 'Product added to wishlist' });
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        res.status(500).json({ success: false, error: 'Failed to update wishlist' });
    }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;

        // Find user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({ success: false, error: 'Wishlist not found' });
        }

        // Remove product from wishlist - ensure we're comparing string representations of ObjectIds
        wishlist.products = wishlist.products.filter(
            product => product.toString() !== productId.toString()
        );

        await wishlist.save();
        res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({ success: false, error: 'Failed to update wishlist' });
    }
};