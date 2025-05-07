const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Nuggets';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected via db.js'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = mongoose.connection;