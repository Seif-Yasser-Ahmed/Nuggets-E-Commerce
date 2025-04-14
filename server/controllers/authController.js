const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername } = require('../models/userModel');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

exports.signup = (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ success: false, error: 'Error hashing password' });
        createUser(username, hash, (err, result) => {
            if (err) return res.status(500).json({ success: false, error: 'Error inserting user' });
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
            if (err) return res.status(500).json({ success: false, error: 'Error comparing passwords' });
            if (!match) return res.status(401).json({ success: false, message: 'Wrong username or password' });

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ success: true, token, data: { id: user.id, username: user.username } });
        });
    });
};