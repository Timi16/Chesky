const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const ChessService = require('../services/chessService');

// Elo rating calculation
const calculateEloRating = (playerRating, opponentRating, outcome) => {
    const k = 32; // K-factor, can be adjusted
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return playerRating + k * (outcome - expectedScore);
};

// Function to record game results
const recordGameResult = async (winnerId, loserId, gameId) => {
    const winner = await User.findById(winnerId);
    const loser = await User.findById(loserId);

    // Update the game history
    await GameHistory.create({
        player: winnerId,
        gameId: gameId,
        result: 'win',
    });

    await GameHistory.create({
        player: loserId,
        gameId: gameId,
        result: 'loss',
    });

    // Update user stats
    winner.wins += 1;
    loser.losses += 1;

    // Update ratings
    winner.rating = calculateEloRating(winner.rating, loser.rating, 1); // Winner's perspective
    loser.rating = calculateEloRating(loser.rating, winner.rating, 0); // Loser's perspective

    await winner.save();
    await loser.save();
};

// Call this function when a game ends
const endGame = async (game) => {
    if (game.status === 'checkmate') {
        const winnerId = game.players.white.equals(game.currentTurn) ? game.players.black : game.players.white;
        const loserId = game.players.white.equals(game.currentTurn) ? game.players.white : game.players.black;
        await recordGameResult(winnerId, loserId, game._id);
    }
};

// Method to get game history
exports.getGameHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        const history = await GameHistory.find({ player: userId }).populate('gameId');
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Method to get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find()
            .sort({ rating: -1 }) // Sort by rating
            .select('username rating wins losses') // Select fields to return
            .limit(10); // Get top 10 players

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ensure to call endGame function when a game ends
exports.makeMove = async (req, res) => {
    const { gameId, move } = req.body;

    try {
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Determine the player's color (white or black)
        const currentPlayerColor = game.players.white.equals(req.user._id) ? 'white' : 'black';

        // Ensure it's the player's turn
        if (game.currentTurn !== currentPlayerColor) {
            return res.status(403).json({ message: `It's not your turn! You are playing as ${currentPlayerColor}.` });
        }

        // Validate and process the move with the chess logic service
        const moveResult = ChessService.makeMove(move, currentPlayerColor);

        // Update the board and move history
        game.board = ChessService.getBoard();  // Update the board with the new state
        game.moveHistory.push(move);  // Record the move in history

        // Switch the turn to the other player
        game.currentTurn = currentPlayerColor === 'white' ? 'black' : 'white';

        // Save the game state
        await game.save();

        // Check if the game has ended and record the result if so
        await endGame(game);

        res.status(200).json({
            message: 'Move made',
            moveResult,
            board: game.board,
            currentTurn: game.currentTurn,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Undo the last move in the game
exports.undoMove = async (req, res) => {
    const { gameId } = req.body;

    try {
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Attempt to undo the last move using ChessService
        const lastMove = ChessService.undoMove(game.moveHistory, game.board);

        // Update the game board and move history
        game.board = lastMove.newBoard;
        game.moveHistory = lastMove.newHistory;

        // Save the updated game state
        await game.save();

        // Respond with success
        res.status(200).json({ 
            message: 'Last move undone', 
            lastMove: lastMove.move, 
            board: game.board 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get the current status of the game
exports.getGameStatus = async (req, res) => {
    const { gameId } = req.params;

    try {
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Get status based on the current board state using ChessService
        const status = ChessService.getGameStatus(game.board);

        // Respond with the game status
        res.status(200).json({ status });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
