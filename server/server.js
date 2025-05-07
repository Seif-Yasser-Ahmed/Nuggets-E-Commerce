// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Added mongoose

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Set up MongoDB connection with improved error handling
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Nuggets';
console.log('Attempting to connect to MongoDB at:', mongoURI);

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        // Continue running the server even if DB connection fails
        console.log('Server will continue running, but database-dependent features will not work');
    });

// Add connection error handler
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

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
// Public routes - Fix: mount auth routes directly at /api/v1 instead of /api/v1/users
app.use('/api/v1', authRoutes);

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