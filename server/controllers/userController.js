const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');
const Review = require('../models/reviewModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Error retrieving profile:', err);
        res.status(500).json({ success: false, error: 'Error retrieving profile' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                telephone: userData.telephone,
                location: userData.location,
                bio: userData.bio,
                occupation: userData.occupation,
                birthday: userData.birthday
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ success: false, error: 'Error updating profile' });
    }
};

// Update user social links
exports.updateSocialLinks = async (req, res) => {
    try {
        const userId = req.params.id;
        const { socialLinks } = req.body;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { social_links: socialLinks },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Social links updated successfully' });
    } catch (err) {
        console.error('Error updating social links:', err);
        res.status(500).json({ success: false, error: 'Error updating social links' });
    }
};

// Configure storage for profile images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.params.id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `user_${userId}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
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

// Update profile image
exports.updateProfileImage = (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            const userId = req.params.id;

            // Validate userId to prevent CastError
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID format'
                });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            const filePath = `/uploads/profiles/${req.file.filename}`;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { personal_image: filePath },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ success: true, data: { image_url: filePath } });
        } catch (err) {
            console.error('Error updating profile image:', err);
            res.status(500).json({ success: false, error: 'Failed to update profile image' });
        }
    });
};

// Get all users (admin only)
exports.getAll = async (req, res) => {
    try {
        const users = await User.find()
            .select('_id username email first_name last_name telephone isAdmin created_at');

        // Transform the data to ensure each document has both _id and id fields to maintain compatibility
        const transformedUsers = users.map(user => {
            const userObj = user.toObject();
            userObj.id = userObj._id; // Add 'id' field that references the _id field
            return userObj;
        });

        // console.log('Users retrieved for admin:', transformedUsers.length);
        res.status(200).json({ success: true, data: transformedUsers });
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ success: false, error: 'Error retrieving users' });
    }
};

// Delete a user
exports.remove = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        // Get user to log their username
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const username = user.username;
        console.log(`Attempting to delete user with ID: ${userId}`);

        // Delete user's associated data
        // 1. Delete user's wishlist
        await Wishlist.deleteOne({ user: userId });

        // 2. Delete user's cart
        await Cart.deleteOne({ user: userId });

        // 3. Delete user's reviews
        await Review.deleteMany({ user: userId });

        // 4. Delete the user
        await User.findByIdAndDelete(userId);

        console.log(`User ${username} (ID: ${userId}) successfully deleted`);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, error: 'Error deleting user' });
    }
};

// Update user admin status
exports.updateAdminStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isAdmin } = req.body;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        console.log('Setting isAdmin to:', isAdmin, 'for user ID:', userId);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAdmin: isAdmin },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User admin status updated to ${isAdmin ? 'admin' : 'regular user'}`
        });
    } catch (err) {
        console.error('Error updating admin status:', err);
        res.status(500).json({ success: false, error: 'Error updating admin status' });
    }
};

// Update user password
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        // Validate userId to prevent CastError
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        // Get user with password included
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the password
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ success: false, error: 'Failed to update password' });
    }
};