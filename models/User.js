const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wins: { type: Number, default: 0 }, // Track wins
    losses: { type: Number, default: 0 }, // Track losses
    rating: { type: Number, default: 1200 }, // Default rating, can be adjusted
    // Other user fields...
});

module.exports = mongoose.model('User', userSchema);
