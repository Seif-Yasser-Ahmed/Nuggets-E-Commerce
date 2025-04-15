// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// const resetRoutes = require('./routes/resetRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const db = require('./db'); // ✅ imported db from db.js

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// app.use('/api/v1/reset', resetRoutes);
// Public routes
app.use('/api/v1/users', authRoutes);

// Protected/user routes
app.use('/api/v1/users', userRoutes);

app.use('/api/v1', adminRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});