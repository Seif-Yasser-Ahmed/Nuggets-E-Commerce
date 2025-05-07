const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Order Items Schema (used as a subdocument)
const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image_url: String
});

// Define the main Order Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Legacy field - for migration compatibility
    user_id: {
        type: Number
    },
    items: [orderItemSchema],
    total_amount: {
        type: Number,
        required: true
    },
    shipping_address: {
        fullName: String,
        street: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
    },
    payment_method: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    // Important: This allows for both legacy numeric _id and new ObjectId _id
    _id: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Order', orderSchema);