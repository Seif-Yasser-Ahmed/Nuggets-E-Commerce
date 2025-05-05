// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// const resetRoutes = require('./routes/resetRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const db = require('./db'); // ✅ imported db from db.js

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir);
}

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/v1/reset', resetRoutes);
// Public routes
app.use('/api/v1/users', authRoutes);

// Protected/user routes
app.use('/api/v1/users', userRoutes);

// Protected/user routes
app.use('/api/v1/users', userRoutes);

// Admin routes
app.use('/api/v1', adminRoutes);

// Product routes
app.use('/api/v1/products', productRoutes);

// Order routes
app.use('/api/v1/orders', orderRoutes);

// Cart routes
app.use('/api/v1/cart', cartRoutes);

// Wishlist routes
app.use('/api/v1/wishlist', wishlistRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});