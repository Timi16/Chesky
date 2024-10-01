const Game = require('../models/Game');
const ChessService = require('../services/chessService');

// Make a move in the game
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

        // Validate and process the move using ChessService
        const moveResult = ChessService.makeMove(move, currentPlayerColor);

        // Update the board and move history
        game.board = ChessService.getBoard();  // Update the board state
        game.moveHistory.push(move);  // Record the move in history

        // Switch the turn to the other player
        game.currentTurn = currentPlayerColor === 'white' ? 'black' : 'white';

        // Save the updated game state
        await game.save();

        // Respond with success
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
