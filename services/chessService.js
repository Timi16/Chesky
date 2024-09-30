const { Chess } = require('chess.js'); // Using chess.js library

class ChessService {
    constructor() {
        this.chess = new Chess(); // Initialize a new chess game
        this.moveHistory = []; // Store history of moves
    }

    getBoard() {
        return this.chess.board(); // Returns the current board state
    }

    makeMove(move) {
        const result = this.chess.move(move); // Attempt to make a move

        if (result === null) {
            throw new Error('Invalid move');
        }

        // Save the move to history
        this.moveHistory.push(move);
        
        // Check if the game is over
        if (this.chess.game_over()) {
            return { result, gameOver: true, status: this.chess.in_checkmate() ? 'checkmate' : 'stalemate' };
        }

        return { result, gameOver: false };
    }

    undoMove() {
        if (this.moveHistory.length === 0) {
            throw new Error('No moves to undo');
        }

        const lastMove = this.moveHistory.pop();
        this.chess.undo(); // Undo the last move
        return lastMove; // Return the undone move
    }

    resetGame() {
        this.chess = new Chess(); // Reset the chess game
        this.moveHistory = []; // Reset the move history
    }

    isPlayerTurn(playerColor) {
        return this.chess.turn() === playerColor; // Check if it's the player's turn
    }

    getGameStatus() {
        return {
            gameOver: this.chess.game_over(),
            status: this.chess.in_checkmate() ? 'checkmate' : this.chess.in_stalemate() ? 'stalemate' : 'ongoing',
            currentTurn: this.chess.turn(),
            moveHistory: this.moveHistory, // Provide move history for analysis
        };
    }

    // Additional helper methods
    getLegalMoves() {
        return this.chess.legal_moves(); // Get all legal moves for the current position
    }
}

module.exports = new ChessService();
