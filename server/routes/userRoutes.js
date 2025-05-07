const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, updateSocialLinks, updateProfileImage, updateAdminStatus, updatePassword, getAll, remove } = require('../controllers/userController');

router.get('/profile/:id', authenticateToken, getProfile);
router.put('/:id', authenticateToken, updateProfile); // Add route to update profile
router.put('/:id/social', authenticateToken, updateSocialLinks); // Add route to update social links
router.post('/:id/profile-image', authenticateToken, updateProfileImage); // Add route to update profile image
router.put('/:id/admin-status', authenticateAdmin, updateAdminStatus); // Add route to update admin status
router.put('/:id/password', authenticateToken, updatePassword); // Add route to update password
router.get('/', authenticateAdmin, getAll);  // Added authenticateAdmin middleware since this gets all users
router.delete('/:id', authenticateToken, remove);

module.exports = router;