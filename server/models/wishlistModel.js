const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);