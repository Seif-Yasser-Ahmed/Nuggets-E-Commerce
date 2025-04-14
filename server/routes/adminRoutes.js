const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const { getAll, remove } = require('../controllers/userController');

// Admin-only routes
router.get('/admin/users', authenticateAdmin, getAll);
router.delete('/admin/users/:id', authenticateAdmin, remove);

module.exports = router;
