const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    players: {
        white: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        black: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    board: {
        type: Array, // To store the current state of the chess board
        required: true,
        default: () => [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ], // Initial board setup
    },
    moveHistory: {
        type: Array, // To keep track of all moves made
        default: [],
    },
    status: {
        type: String,
        enum: ['ongoing', 'checkmate', 'stalemate', 'draw'], // Possible game statuses
        default: 'ongoing',
    },
    currentTurn: {
        type: String,
        enum: ['white', 'black'], // Whose turn it is to play
        default: 'white', // White always starts
    },
    scheduledTime: {
        type: Date, // For games that are scheduled for a future time
        default: null, // Can be null for immediate play
    },
    gameResult: {
        type: String,
        enum: ['whiteWon', 'blackWon', 'draw', 'inProgress'], // Stores the result of the game
        default: 'inProgress',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the updatedAt field
gameSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Export the Game model
module.exports = mongoose.model('Game', gameSchema);
