const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const mongoose = require('mongoose');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const {
            userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        } = req.body;

        // Create new order
        const newOrder = new Order({
            user: userId,
            items,
            total_amount: totalAmount,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            status: 'pending'
        });

        // Save the order
        const savedOrder = await newOrder.save();

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear the user's cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orderId: savedOrder._id
        });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .sort({ created_at: -1 });

        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ success: false, error: 'Error retrieving orders' });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId;

        const orders = await Order.find({ user: userId })
            .sort({ created_at: -1 });

        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('Error retrieving user orders:', err);
        res.status(500).json({ success: false, error: 'Error retrieving orders' });
    }
};

// Get order statistics (admin)
exports.getOrderStats = async (req, res) => {
    try {
        // Count total orders
        const totalOrders = await Order.countDocuments();

        // Count orders by status
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format status counts into a more usable object
        const statusStats = {};
        statusCounts.forEach(status => {
            statusStats[status._id] = status.count;
        });

        // Get total revenue
        const revenueData = await Order.aggregate([
            {
                $match: { status: { $ne: 'cancelled' } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_amount" }
                }
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Recent revenue data (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    created_at: { $gte: lastWeek },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
                    },
                    revenue: { $sum: "$total_amount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                statusStats,
                totalRevenue,
                dailyRevenue
            }
        });
    } catch (err) {
        console.error('Error retrieving order statistics:', err);
        res.status(500).json({ success: false, error: 'Error retrieving order statistics' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Check if this is a special route rather than an ObjectId
        if (orderId === 'stats') {
            return res.status(400).json({
                success: false,
                error: 'Invalid order ID. Use /orders/stats for statistics.'
            });
        }

        // Validate if orderId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid order ID format. Must be a valid MongoDB ObjectId.'
            });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                select: 'name image_url'
            });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.error('Error retrieving order:', err);
        res.status(500).json({ success: false, error: 'Error retrieving order' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: updatedOrder
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ success: false, error: 'Error updating order status' });
    }
};

// Get recent orders (admin)
exports.getRecentOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find()
            .populate('user', 'username email')
            .sort({ created_at: -1 })
            .limit(limit);

        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('Error retrieving recent orders:', err);
        res.status(500).json({ success: false, error: 'Error retrieving recent orders' });
    }
};