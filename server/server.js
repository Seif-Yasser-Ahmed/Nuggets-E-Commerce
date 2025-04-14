// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();  // Load variables from .env

const app = express();
const port = process.env.PORT || 5000;

// MySQL connection setup (using credentials from .env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Middleware: Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// -------------------------
// Signup: Adding a New User
// -------------------------
app.post('/api/v1/users/signup', (req, res) => {
    const { username, password } = req.body;
    const query = "INSERT INTO user (username, password) VALUES (?, ?)";
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ success: false, error: 'Error inserting data' });
        }
        res.status(201).json({ success: true, message: 'User created successfully', data: result });
    });
});

// -------------------------
// Signin: Verify User Credentials
// -------------------------
app.post('/api/v1/users/signin', (req, res) => {
    const { username, password } = req.body;
    // Query selecting only id and username, excluding the password
    const query = "SELECT id, username FROM user WHERE username = ? AND password = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ success: false, error: 'Error fetching data' });
        }
        if (results.length === 0) {
            // No matching record found
            return res.status(401).json({ success: false, message: 'Wrong email or password' });
        }
        // Return the matched user details
        const user = results[0];
        res.status(200).json({ success: true, data: user });
    });
});

// -------------------------
// Profile: Retrieve User Information by ID
// -------------------------
app.get('/api/v1/users/profile/:id', (req, res) => {
    const userId = req.params.id;
    const query = "SELECT id, username FROM user WHERE id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving user profile:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving user profile' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: results[0] });
    });
});

// -------------------------
// User Info Retrieval: Get All Users (optional)
// -------------------------
app.get('/api/v1/users', (req, res) => {
    const query = "SELECT id, username FROM user";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving users:', err);
            return res.status(500).json({ success: false, error: 'Error retrieving users' });
        }
        res.status(200).json({ success: true, data: results });
    });
});

// -------------------------
// Remove User: Delete a User by ID
// -------------------------
app.delete('/api/v1/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = "DELETE FROM user WHERE id = ?";
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ success: false, error: 'Error deleting user' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found or already deleted' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    });
});

// -------------------------
// A Simple Test Endpoint
// -------------------------
app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
