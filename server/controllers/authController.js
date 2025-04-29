const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getUserByEmail } = require('../models/userModel');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

exports.signup = (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ success: false, error: 'Error hashing password' });

        createUser({ firstName, lastName, email, username, password: hash }, (err, result) => {
            if (err) {
                console.error('DB Insert Error:', err);
                return res.status(500).json({ success: false, error: 'Error inserting user' });
            }

            res.status(201).json({ success: true, message: 'User created successfully' });
        });
    });
};


exports.signin = (req, res) => {
    const { username, password } = req.body;

    getUserByUsername(username, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error fetching user' });
        if (results.length === 0) return res.status(401).json({ success: false, message: 'Wrong username or password' });

        const user = results[0];

        bcrypt.compare(password, user.password, (err, match) => {
            if (!match) return res.status(401).json({ success: false, message: 'Wrong username or password' });

            // ✅ Log the user to verify
            console.log('[Login Success] User:', user);

            // ✅ Must include isAdmin here
            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                token,
                data: { id: user.id, username: user.username, isAdmin: user.isAdmin }
            });
        });
    });
};

// Handle Facebook login
exports.facebookLogin = (req, res) => {
    console.log("Facebook login request received:", req.body);
    const { email, name, userID } = req.body;

    // Check if email is missing
    if (!email) {
        console.log("Facebook login failed: Missing email in the data received from Facebook");
        return res.status(400).json({ success: false, error: 'Email is required for Facebook login' });
    }

    // Check if user exists with this email
    getUserByEmail(email, (err, results) => {
        if (err) {
            console.log("Facebook login error:", err);
            return res.status(500).json({ success: false, error: 'Error checking user' });
        }

        let user;

        if (results.length === 0) {
            console.log("Creating new user for Facebook login with email:", email);
            // Create new user if doesn't exist
            const username = `fb_${userID}`;
            const generatedPassword = Math.random().toString(36).slice(-10); // Random password

            // Hash the generated password
            bcrypt.hash(generatedPassword, saltRounds, (err, hash) => {
                if (err) return res.status(500).json({ success: false, error: 'Error creating user' });

                // Extract first and last name from the full name
                const nameParts = name.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

                // Create the user in the database
                createUser({
                    firstName,
                    lastName,
                    email,
                    username,
                    password: hash,
                    provider: 'facebook',
                    providerId: userID
                }, (err, result) => {
                    if (err) {
                        console.error('Facebook User Creation Error:', err);
                        return res.status(500).json({ success: false, error: 'Error creating user' });
                    }

                    // Get the newly created user
                    getUserByEmail(email, (err, newUser) => {
                        if (err || newUser.length === 0) {
                            return res.status(500).json({ success: false, error: 'Error fetching newly created user' });
                        }

                        user = newUser[0];
                        console.log("New user created for Facebook login:", user);

                        // Generate token for the new user
                        const token = jwt.sign(
                            { id: user.id, username: user.username, isAdmin: user.isAdmin || false },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        res.status(200).json({
                            success: true,
                            token,
                            data: {
                                id: user.id,
                                username: user.username,
                                isAdmin: user.isAdmin || false
                            }
                        });
                    });
                });
            });
        } else {
            // User exists, log them in
            user = results[0];
            console.log("Existing user found for Facebook login:", user);

            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: user.isAdmin || false },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                token,
                data: {
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin || false
                }
            });
        }
    });
};

// Handle Google login
exports.googleLogin = (req, res) => {
    const { email, name, googleId } = req.body;

    // Check if user exists with this email
    getUserByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error checking user' });

        let user;

        if (results.length === 0) {
            // Create new user if doesn't exist
            const username = `google_${googleId}`;
            const generatedPassword = Math.random().toString(36).slice(-10); // Random password

            // Hash the generated password
            bcrypt.hash(generatedPassword, saltRounds, (err, hash) => {
                if (err) return res.status(500).json({ success: false, error: 'Error creating user' });

                // Extract first and last name from the full name
                const nameParts = name.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

                // Create the user in the database
                createUser({
                    firstName,
                    lastName,
                    email,
                    username,
                    password: hash,
                    provider: 'google',
                    providerId: googleId
                }, (err, result) => {
                    if (err) {
                        console.error('Google User Creation Error:', err);
                        return res.status(500).json({ success: false, error: 'Error creating user' });
                    }

                    // Get the newly created user
                    getUserByEmail(email, (err, newUser) => {
                        if (err || newUser.length === 0) {
                            return res.status(500).json({ success: false, error: 'Error fetching newly created user' });
                        }

                        user = newUser[0];

                        // Generate token for the new user
                        const token = jwt.sign(
                            { id: user.id, username: user.username, isAdmin: user.isAdmin || false },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        res.status(200).json({
                            success: true,
                            token,
                            data: {
                                id: user.id,
                                username: user.username,
                                isAdmin: user.isAdmin || false
                            }
                        });
                    });
                });
            });
        } else {
            // User exists, log them in
            user = results[0];

            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: user.isAdmin || false },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                token,
                data: {
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin || false
                }
            });
        }
    });
};