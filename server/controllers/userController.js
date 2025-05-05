const { getUserById, getAllUsers, deleteUser, updateUser, updateUserSocialLinks, updateUserProfileImage, updateUserAdminStatus } = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('../db'); // Add db connection
const saltRounds = 10;

exports.getProfile = (req, res) => {
    const userId = req.params.id;
    getUserById(userId, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error retrieving profile' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: results[0] });
    });
};

exports.updateProfile = (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    updateUser(userId, userData, (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).json({ success: false, error: 'Error updating profile' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    });
};

exports.updateSocialLinks = (req, res) => {
    const userId = req.params.id;
    const { socialLinks } = req.body;

    if (!socialLinks) {
        return res.status(400).json({ success: false, message: 'Social links data is required' });
    }

    // Convert socialLinks object to JSON string for storage
    const socialLinksJson = JSON.stringify(socialLinks);

    updateUserSocialLinks(userId, socialLinksJson, (err, result) => {
        if (err) {
            console.error('Error updating social links:', err);
            return res.status(500).json({ success: false, error: 'Error updating social links' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Social links updated successfully' });
    });
};

// Setup storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `user_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('image');

exports.updateProfileImage = (req, res) => {
    const userId = req.params.id;

    upload(req, res, function (err) {
        if (err) {
            console.error('Error uploading image:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        updateUserProfileImage(userId, imageUrl, (err, result) => {
            if (err) {
                console.error('Error updating profile image in database:', err);
                return res.status(500).json({ success: false, error: 'Error updating profile image' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Profile image updated successfully',
                data: { imageUrl }
            });
        });
    });
};

exports.getAll = (req, res) => {
    getAllUsers((err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error retrieving users' });
        res.status(200).json({ success: true, data: results });
    });
};

exports.remove = (req, res) => {
    const userId = req.params.id;

    // Log the deletion attempt for debugging
    console.log(`Attempting to delete user with ID: ${userId}`);

    // First check if the user exists
    const checkUserQuery = 'SELECT username FROM user WHERE id = ?';
    db.query(checkUserQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error checking user existence:', err);
            return res.status(500).json({ success: false, error: 'Error checking user existence' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const username = results[0].username;

        // Delete the user's associated data first
        // This ensures all foreign key relationships are properly handled

        // 1. Delete user's wishlist items
        const deleteWishlistQuery = 'DELETE wi FROM wishlist_item wi JOIN wishlist w ON wi.wishlist_id = w.id WHERE w.user_id = ?';
        db.query(deleteWishlistQuery, [userId], (err) => {
            if (err) {
                console.error('Error deleting wishlist items:', err);
                return res.status(500).json({ success: false, error: 'Error deleting wishlist items' });
            }

            // 2. Delete user's wishlist
            const deleteWishlistTableQuery = 'DELETE FROM wishlist WHERE user_id = ?';
            db.query(deleteWishlistTableQuery, [userId], (err) => {
                if (err) {
                    console.error('Error deleting wishlist:', err);
                    return res.status(500).json({ success: false, error: 'Error deleting wishlist' });
                }

                // 3. Delete user's cart items
                const deleteCartQuery = 'DELETE FROM cart WHERE user_id = ?';
                db.query(deleteCartQuery, [userId], (err) => {
                    if (err) {
                        console.error('Error deleting cart items:', err);
                        return res.status(500).json({ success: false, error: 'Error deleting cart items' });
                    }

                    // 4. Delete user's reviews
                    const deleteReviewsQuery = 'DELETE FROM reviews WHERE user_id = ?';
                    db.query(deleteReviewsQuery, [userId], (err) => {
                        if (err) {
                            console.error('Error deleting reviews:', err);
                            return res.status(500).json({ success: false, error: 'Error deleting reviews' });
                        }

                        // Finally, delete the user
                        const deleteUserQuery = 'DELETE FROM user WHERE id = ?';
                        db.query(deleteUserQuery, [userId], (err, result) => {
                            if (err) {
                                console.error('Error deleting user:', err);
                                return res.status(500).json({ success: false, error: 'Error deleting user' });
                            }

                            if (result.affectedRows === 0) {
                                return res.status(404).json({ success: false, message: 'User not found' });
                            }

                            console.log(`User ${username} (ID: ${userId}) successfully deleted`);
                            res.status(200).json({ success: true, message: 'User deleted successfully' });
                        });
                    });
                });
            });
        });
    });
};

exports.updateAdminStatus = (req, res) => {
    const userId = req.params.id;
    const { isAdmin } = req.body;

    console.log('Updating admin status for user:', userId);
    console.log('isAdmin value received:', isAdmin);

    if (isAdmin === undefined) {
        console.log('isAdmin field is missing');
        return res.status(400).json({ success: false, message: 'isAdmin field is required' });
    }

    updateUserAdminStatus(userId, isAdmin, (err, result) => {
        if (err) {
            console.error('Error updating admin status:', err);
            return res.status(500).json({ success: false, error: 'Error updating admin status' });
        }

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Admin status updated successfully' });
    });
};

exports.updatePassword = (req, res) => {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    // First get the user to verify current password
    const getUserQuery = 'SELECT password FROM user WHERE id = ?';
    db.query(getUserQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user for password update:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const storedHashedPassword = results[0].password;

        // Verify current password
        bcrypt.compare(currentPassword, storedHashedPassword, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, error: 'Password verification error' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            // Hash the new password
            bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                if (err) {
                    console.error('Error hashing new password:', err);
                    return res.status(500).json({ success: false, error: 'Error hashing new password' });
                }

                // Update the password in the database
                const updateQuery = 'UPDATE user SET password = ? WHERE id = ?';
                db.query(updateQuery, [hash, userId], (err, result) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).json({ success: false, error: 'Failed to update password' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ success: false, message: 'User not found' });
                    }

                    res.status(200).json({ success: true, message: 'Password updated successfully' });
                });
            });
        });
    });
};