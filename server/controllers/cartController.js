const db = require('../db');

// Get user's cart
exports.getCart = (req, res) => {
    const userId = req.params.userId;

    // Simple query to get cart items for a user
    const query = `
        SELECT c.id, c.product_id, p.name, p.price, p.image_url, c.quantity 
        FROM cart c
        JOIN product p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving cart' });
        }

        res.status(200).json({
            success: true,
            data: results,
            total: results.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
    });
};

// Get cart item count
exports.getCartCount = (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT SUM(quantity) as count
        FROM cart
        WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart count:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving cart count' });
        }

        const count = results[0].count || 0;
        res.status(200).json({ success: true, data: { count } });
    });
};

// Add item to cart
exports.addToCart = (req, res) => {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ success: false, error: 'User ID and Product ID are required' });
    }

    // Check if the item already exists in cart
    const checkQuery = 'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?';

    db.query(checkQuery, [userId, productId], (err, results) => {
        if (err) {
            console.error('Error checking cart:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length > 0) {
            // Update existing cart item
            const cartItemId = results[0].id;
            const newQuantity = results[0].quantity + quantity;

            const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';

            db.query(updateQuery, [newQuantity, cartItemId], (err, result) => {
                if (err) {
                    console.error('Error updating cart:', err);
                    return res.status(500).json({ success: false, error: 'Failed to update cart' });
                }

                res.status(200).json({ success: true, message: 'Cart updated successfully' });
            });
        } else {
            // Insert new cart item
            const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';

            db.query(insertQuery, [userId, productId, quantity], (err, result) => {
                if (err) {
                    console.error('Error adding to cart:', err);
                    return res.status(500).json({ success: false, error: 'Failed to add to cart' });
                }

                res.status(201).json({
                    success: true,
                    message: 'Added to cart successfully',
                    data: { id: result.insertId }
                });
            });
        }
    });
};

// Update cart item
exports.updateCartItem = (req, res) => {
    const cartItemId = req.params.cartItemId;
    const { quantity } = req.body;

    if (!quantity) {
        return res.status(400).json({ success: false, error: 'Quantity is required' });
    }

    const query = 'UPDATE cart SET quantity = ? WHERE id = ?';

    db.query(query, [quantity, cartItemId], (err, result) => {
        if (err) {
            console.error('Error updating cart item:', err);
            return res.status(500).json({ success: false, error: 'Failed to update cart item' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }

        res.status(200).json({ success: true, message: 'Cart item updated successfully' });
    });
};

// Remove cart item
exports.removeCartItem = (req, res) => {
    const cartItemId = req.params.cartItemId;

    const query = 'DELETE FROM cart WHERE id = ?';

    db.query(query, [cartItemId], (err, result) => {
        if (err) {
            console.error('Error removing cart item:', err);
            return res.status(500).json({ success: false, error: 'Failed to remove cart item' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }

        res.status(200).json({ success: true, message: 'Cart item removed successfully' });
    });
};