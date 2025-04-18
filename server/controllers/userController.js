const { getUserById, getAllUsers, deleteUser, updateUser, updateUserSocialLinks, updateUserProfileImage } = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    deleteUser(userId, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: 'Error deleting user' });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    });
};