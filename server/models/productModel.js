const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image_url: String,
    stock: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    specs: {
        type: Map,
        of: String
    },
    colors: [{
        name: String,
        value: String
    }],
    sizes: [String],
    rating: {
        type: Number,
        default: 0
    },
    review_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    }
});

module.exports = mongoose.model('Product', productSchema);