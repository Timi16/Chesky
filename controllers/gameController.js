const Game = require('../models/Game');
const ChessService = require('../services/chessService');

exports.makeMove = async (req, res) => {
    const { gameId, move } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }

    // Check if it's the player's turn
    const currentPlayerColor = game.players.white.equals(req.user.userId) ? 'white' : 'black';
    if (!ChessService.isPlayerTurn(currentPlayerColor, game.moveHistory)) {
        return res.status(403).json({ message: "It's not your turn!" });
    }

    try {
        // Attempt to make the move using ChessService
        const moveResult = ChessService.makeMove(move, game.board, currentPlayerColor);

        // Update the game with the new board state
        game.board = moveResult.newBoard;
        game.moveHistory.push(moveResult.move); // Save the move to history

        // Update the game status
        game.status = ChessService.getGameStatus(game.board); // Pass the board to get the status

        await game.save();

        // Notify players of the move
        res.status(200).json({ message: 'Move made', moveResult: moveResult.move, board: game.board, status: game.status });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.undoMove = async (req, res) => {
    const { gameId } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }

    try {
        // Attempt to undo the last move using ChessService
        const lastMove = ChessService.undoMove(game.moveHistory, game.board);
        
        // Update the game board and move history
        game.board = lastMove.newBoard;
        game.moveHistory = lastMove.newHistory;

        await game.save();

        res.status(200).json({ message: 'Last move undone', lastMove: lastMove.move, board: game.board });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getGameStatus = async (req, res) => {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }

    const status = ChessService.getGameStatus(game.board); // Get status based on current board

    res.status(200).json({ status });
};
