const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    result: { type: String, enum: ['win', 'loss', 'draw'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);
