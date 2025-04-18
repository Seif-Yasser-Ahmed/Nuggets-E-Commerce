const db = require('../db');

// Get user's wishlist
exports.getWishlist = (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Query directly using three-table join instead of nested queries
    const query = `
        SELECT wi.id AS wishlist_item_id, p.id, p.name, p.description, p.price, p.image_url as image, p.category 
        FROM wishlist w
        JOIN wishlist_item wi ON w.id = wi.wishlist_id
        JOIN product p ON wi.product_id = p.id
        WHERE w.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching wishlist items:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving wishlist items' });
        }

        res.status(200).json({ success: true, data: results });
    });
};

// Add item to wishlist
exports.addToWishlist = (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ success: false, error: 'User ID and Product ID are required' });
    }

    // Find or create the user's wishlist
    db.query('SELECT id FROM wishlist WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking wishlist:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        let wishlistId;

        if (results.length === 0) {
            // Create a new wishlist for this user
            db.query('INSERT INTO wishlist (user_id) VALUES (?)', [userId], (err, result) => {
                if (err) {
                    console.error('Error creating wishlist:', err);
                    return res.status(500).json({ success: false, error: 'Failed to create wishlist' });
                }

                addWishlistItem(result.insertId, productId, res);
            });
        } else {
            // Use existing wishlist
            wishlistId = results[0].id;

            // Check if item already exists in wishlist
            db.query(
                'SELECT id FROM wishlist_item WHERE wishlist_id = ? AND product_id = ?',
                [wishlistId, productId],
                (err, results) => {
                    if (err) {
                        console.error('Error checking wishlist item:', err);
                        return res.status(500).json({ success: false, error: 'Database error' });
                    }

                    if (results.length > 0) {
                        return res.status(200).json({
                            success: true,
                            message: 'Item already in wishlist',
                            isExisting: true
                        });
                    }

                    addWishlistItem(wishlistId, productId, res);
                }
            );
        }
    });
};

// Helper function to add an item to a wishlist
function addWishlistItem(wishlistId, productId, res) {
    db.query(
        'INSERT INTO wishlist_item (wishlist_id, product_id) VALUES (?, ?)',
        [wishlistId, productId],
        (err, result) => {
            if (err) {
                console.error('Error adding to wishlist:', err);
                return res.status(500).json({ success: false, error: 'Failed to add to wishlist' });
            }

            res.status(201).json({
                success: true,
                message: 'Added to wishlist successfully',
                data: { id: result.insertId }
            });
        }
    );
}

// Remove from wishlist
exports.removeFromWishlist = (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // First, get the user's wishlist ID
    db.query('SELECT id FROM wishlist WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error finding wishlist:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        const wishlistId = results[0].id;

        // Delete the wishlist item
        db.query(
            'DELETE FROM wishlist_item WHERE wishlist_id = ? AND product_id = ?',
            [wishlistId, productId],
            (err, result) => {
                if (err) {
                    console.error('Error removing from wishlist:', err);
                    return res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
                }

                res.status(200).json({ success: true, message: 'Item removed from wishlist successfully' });
            }
        );
    });
};