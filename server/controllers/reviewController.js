// src/controllers/reviewController.js
const db = require('../db');

// Get all reviews for a product
exports.getProductReviews = (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    // First check if reviews table exists by making a simpler query
    const simpleQuery = `
        SELECT * FROM reviews 
        WHERE product_id = ?
        LIMIT 1
    `;

    db.query(simpleQuery, [productId], (err, results) => {
        if (err) {
            // If there's an error here, it might be because the table doesn't exist
            console.error('Error checking reviews table:', err);

            if (err.code === 'ER_NO_SUCH_TABLE') {
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'No reviews available for this product'
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Error accessing reviews database'
            });
        }

        // If we get here, the reviews table exists, so proceed with the full query
        const fullQuery = `
            SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
                COALESCE(u.first_name, 'Anonymous') as first_name, 
                COALESCE(u.last_name, 'User') as last_name, 
                COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Anonymous User') as user_name,
                u.personal_image
            FROM reviews r
            LEFT JOIN user u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;

        db.query(fullQuery, [productId], (err, results) => {
            if (err) {
                console.error('Error fetching product reviews:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error retrieving product reviews',
                    details: err.message
                });
            }

            res.status(200).json({ success: true, data: results });
        });
    });
};

// Add a new review
exports.addReview = (req, res) => {
    const productId = req.params.productId;
    const { user_id, rating, comment } = req.body;

    if (!productId || !user_id) {
        return res.status(400).json({ success: false, error: 'Product ID and User ID are required' });
    }

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: 'Valid rating (1-5) is required' });
    }

    // First check if the user has already reviewed this product
    db.query('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?', [productId, user_id], (err, results) => {
        if (err) {
            console.error('Error checking existing review:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, error: 'You have already reviewed this product' });
        }

        // Insert the new review
        const query = `
            INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `;

        db.query(query, [productId, user_id, rating, comment], (err, result) => {
            if (err) {
                console.error('Error adding review:', err);
                return res.status(500).json({ success: false, error: 'Failed to add review' });
            }

            // Update the product's average rating
            updateProductRating(productId);

            res.status(201).json({
                success: true,
                message: 'Review added successfully',
                data: {
                    id: result.insertId,
                    product_id: productId,
                    user_id,
                    rating,
                    comment,
                    created_at: new Date()
                }
            });
        });
    });
};

// Update a review
exports.updateReview = (req, res) => {
    const productId = req.params.productId;
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;
    const userId = req.body.user_id || req.user.id; // Get from body or JWT

    if (!reviewId) {
        return res.status(400).json({ success: false, error: 'Review ID is required' });
    }

    // Verify the review belongs to this user
    db.query('SELECT * FROM reviews WHERE id = ? AND user_id = ?', [reviewId, userId], (err, results) => {
        if (err) {
            console.error('Error checking review ownership:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(403).json({ success: false, error: 'You can only edit your own reviews' });
        }

        // Update the review
        const updateQuery = `
            UPDATE reviews
            SET rating = ?, comment = ?
            WHERE id = ?
        `;

        db.query(updateQuery, [rating, comment, reviewId], (err, result) => {
            if (err) {
                console.error('Error updating review:', err);
                return res.status(500).json({ success: false, error: 'Failed to update review' });
            }

            // Update product average rating
            updateProductRating(productId);

            res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                data: {
                    id: reviewId,
                    product_id: productId,
                    user_id: userId,
                    rating,
                    comment
                }
            });
        });
    });
};

// Delete a review
exports.deleteReview = (req, res) => {
    const productId = req.params.productId;
    const reviewId = req.params.reviewId;
    const userId = req.user.id; // Get from JWT

    if (!reviewId) {
        return res.status(400).json({ success: false, error: 'Review ID is required' });
    }

    // Verify the review belongs to this user or user is admin
    db.query('SELECT * FROM reviews WHERE id = ?', [reviewId], (err, results) => {
        if (err) {
            console.error('Error checking review:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        const isAdmin = req.user && req.user.isAdmin;
        const isOwner = results[0].user_id === userId;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, error: 'You can only delete your own reviews' });
        }

        // Delete the review
        db.query('DELETE FROM reviews WHERE id = ?', [reviewId], (err, result) => {
            if (err) {
                console.error('Error deleting review:', err);
                return res.status(500).json({ success: false, error: 'Failed to delete review' });
            }

            // Update product average rating
            updateProductRating(productId);

            res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });
        });
    });
};

// Helper function to update a product's rating
function updateProductRating(productId) {
    const query = `
        SELECT AVG(rating) as average_rating, COUNT(*) as review_count
        FROM reviews
        WHERE product_id = ?
    `;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error calculating average rating:', err);
            return;
        }

        const averageRating = results[0].average_rating || 0;
        const reviewCount = results[0].review_count || 0;

        // Update the product's rating and review count
        db.query(
            'UPDATE product SET rating = ?, review_count = ? WHERE id = ?',
            [averageRating, reviewCount, productId],
            (err) => {
                if (err) {
                    console.error('Error updating product rating:', err);
                }
            }
        );
    });
}