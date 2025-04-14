const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getProfile, getAll, remove } = require('../controllers/userController');

router.get('/profile/:id', authenticateToken, getProfile);
router.get('/', getAll);
router.delete('/:id', remove);

module.exports = router;