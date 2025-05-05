const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const { getAll, remove, updateAdminStatus } = require('../controllers/userController');

// Admin-only routes
router.get('/admin/users', authenticateAdmin, getAll);
router.delete('/admin/users/:id', authenticateAdmin, remove);
router.put('/admin/users/:id/admin-status', authenticateAdmin, updateAdminStatus);

module.exports = router;
