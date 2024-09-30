// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 1200 }, // Starting rating
    challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track challenges sent
});

module.exports = mongoose.model('User', UserSchema);
