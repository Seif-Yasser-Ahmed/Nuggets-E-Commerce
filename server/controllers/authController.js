const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Add a default value of 10 if the environment variable is not set
const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({ success: false, error: 'Email, username and password are required' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ success: false, error: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        // Hash password
        const hash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hash,
            first_name: firstName,
            last_name: lastName
        });

        await newUser.save();

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ success: false, error: 'Error creating user: ' + err.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Wrong username or password' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Wrong username or password' });
        }

        // Log successful login
        console.log('[Login Success] User:', user);

        // Create JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, error: 'Error during login' });
    }
};

// Handle Google login
exports.googleLogin = async (req, res) => {
    try {
        const { email, name, googleId } = req.body;

        // Check if user exists with this email
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            const username = `google_${googleId}`;
            const generatedPassword = Math.random().toString(36).slice(-10); // Random password

            // Hash the generated password
            const hash = await bcrypt.hash(generatedPassword, saltRounds);

            // Extract first and last name
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

            // Create the user
            user = new User({
                username,
                email,
                password: hash,
                first_name: firstName,
                last_name: lastName,
                provider: 'google',
                provider_id: googleId
            });

            await user.save();
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin || false },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, error: 'Error during Google login' });
    }
};

// Handle Facebook login
exports.facebookLogin = async (req, res) => {
    try {
        const { email, name, facebookId } = req.body;

        // Check if user exists with this email
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            const username = `fb_${facebookId}`;
            const generatedPassword = Math.random().toString(36).slice(-10); // Random password

            // Hash the generated password
            const hash = await bcrypt.hash(generatedPassword, saltRounds);

            // Extract first and last name
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

            // Create the user
            user = new User({
                username,
                email,
                password: hash,
                first_name: firstName,
                last_name: lastName,
                provider: 'facebook',
                provider_id: facebookId
            });

            await user.save();
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin || false },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (err) {
        console.error('Facebook login error:', err);
        res.status(500).json({ success: false, error: 'Error during Facebook login' });
    }
};