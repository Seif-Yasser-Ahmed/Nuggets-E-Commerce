// src/controllers/reviewController.js
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'username personal_image')
            .sort({ created_at: -1 });

        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        console.error('Error retrieving reviews:', err);
        res.status(500).json({ success: false, error: 'Error retrieving reviews' });
    }
};

// Add a new review
exports.addReview = async (req, res) => {
    try {
        const { productId, userId, rating, comment } = req.body;

        if (!productId || !userId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Product ID, user ID, and rating are required'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }

        // Create new review
        const newReview = new Review({
            product: productId,
            user: userId,
            rating,
            comment
        });

        await newReview.save();

        // Update product rating
        const reviews = await Review.find({ product: productId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            review_count: reviews.length
        });

        res.status(201).json({ success: true, message: 'Review added successfully' });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ success: false, error: 'Failed to add review' });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { rating, comment } = req.body;
        const userId = req.user.id; // From auth middleware

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        // Make sure the user owns this review
        if (review.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only edit your own reviews'
            });
        }

        // Update the review
        review.rating = rating || review.rating;
        review.comment = comment !== undefined ? comment : review.comment;

        await review.save();

        // Recalculate product ratings
        const productId = review.product;
        const reviews = await Review.find({ product: productId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(avgRating * 10) / 10,
            review_count: reviews.length
        });

        res.status(200).json({ success: true, message: 'Review updated successfully' });
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ success: false, error: 'Failed to update review' });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.user.id; // From auth middleware

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        // Make sure the user owns this review or is an admin
        if (review.user.toString() !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only delete your own reviews'
            });
        }

        // Save product ID before deleting review
        const productId = review.product;

        // Delete the review
        await Review.findByIdAndDelete(reviewId);

        // Recalculate product ratings
        const reviews = await Review.find({ product: productId });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviews.length;

            await Product.findByIdAndUpdate(productId, {
                rating: Math.round(avgRating * 10) / 10,
                review_count: reviews.length
            });
        } else {
            // No reviews left
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                review_count: 0
            });
        }

        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ success: false, error: 'Failed to delete review' });
    }
};