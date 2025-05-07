const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: String,
    last_name: String,
    personal_image: String,
    location: String,
    bio: String,
    occupation: String,
    birthday: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    telephone: String,
    social_links: {
        website: String,
        github: String,
        linkedin: String,
        twitter: String,
        instagram: String,
        facebook: String
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    }
});

module.exports = mongoose.model('User', userSchema);