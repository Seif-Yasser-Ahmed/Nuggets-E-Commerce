const express = require('express');
const router = express.Router();
const { signup, signin, facebookLogin, googleLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/facebook-login', facebookLogin);
router.post('/google-login', googleLogin);

module.exports = router;