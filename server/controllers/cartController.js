const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // Find cart and populate product details
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price image_url'
            });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: [],
                total: 0
            });
        }

        // Calculate total
        let total = 0;
        const cartItems = cart.items.map(item => {
            const subtotal = item.product.price * item.quantity;
            total += subtotal;

            return {
                id: item._id,
                product_id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image_url: item.product.image_url,
                quantity: item.quantity
            };
        });

        res.status(200).json({
            success: true,
            data: cartItems,
            total
        });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ success: false, error: 'Error retrieving cart' });
    }
};

// Get cart item count
exports.getCartCount = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        const cart = await Cart.findOne({ user: userId });
        const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

        res.status(200).json({ success: true, data: { count } });
    } catch (err) {
        console.error('Error fetching cart count:', err);
        res.status(500).json({ success: false, error: 'Error retrieving cart count' });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, error: 'User ID and Product ID are required' });
        }

        // Validate userId and productId to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid User ID or Product ID format'
            });
        }

        // Find the product to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Find or create user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }]
            });
            await cart.save();
            return res.status(201).json({ success: true, message: 'Product added to cart' });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update existing item quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        res.status(200).json({ success: true, message: 'Cart updated successfully' });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, error: 'Valid quantity is required' });
        }

        // Get userId from JWT token and validate
        const userId = req.user.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // Validate cartItemId
        if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({ success: false, error: 'Invalid cart item ID' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, error: 'Cart not found' });
        }

        // Find the specific item
        const cartItem = cart.items.id(cartItemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }

        // Update quantity
        cartItem.quantity = quantity;
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart item updated' });
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).json({ success: false, error: 'Failed to update cart item' });
    }
};

// Remove cart item
exports.removeCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const userId = req.user.id; // Get from JWT token

        // Validate userId and cartItemId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({ success: false, error: 'Invalid cart item ID' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, error: 'Cart not found' });
        }

        // Remove the item from cart
        cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);
        await cart.save();

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error('Error removing cart item:', err);
        res.status(500).json({ success: false, error: 'Failed to remove cart item' });
    }
};