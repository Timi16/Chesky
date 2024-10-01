const Chess = require('chess.js').Chess; // Use a chess library like chess.js

// In-memory game instance (could be expanded to support multiple games)
let chessGame = new Chess();

// Service to handle chess logic
const ChessService = {
    // Initialize a new chess game board
    getInitialBoard: () => {
        chessGame.reset(); // Resets the chess board to the initial state
        return chessGame.board(); // Returns the board's current state
    },

    // Make a move in the game
    makeMove: (move, currentPlayerColor) => {
        const moveObj = {
            from: move.from,
            to: move.to,
            promotion: move.promotion // Add pawn promotion if needed (e.g., to 'q')
        };

        // Ensure it's the correct player's turn and validate the move
        if (chessGame.turn() !== currentPlayerColor[0]) {
            throw new Error(`It's not ${currentPlayerColor}'s turn!`);
        }

        // Attempt to make the move using chess.js
        const result = chessGame.move(moveObj);

        if (result === null) {
            throw new Error('Invalid move');
        }

        // Return the updated board after the move
        return chessGame.board();
    },

    // Get the current board state
    getBoard: () => {
        return chessGame.board(); // Returns the current state of the chessboard
    },

    // Undo the last move
    undoMove: (moveHistory, board) => {
        // Undo the last move on the chessboard
        chessGame.undo();

        // Remove the last move from the move history
        const newHistory = moveHistory.slice(0, -1);

        // Return the updated board and move history
        return {
            newBoard: chessGame.board(),
            newHistory,
            move: chessGame.history().pop() // Last move before undo
        };
    },

    // Get the game status (ongoing, checkmate, stalemate, etc.)
    getGameStatus: (board) => {
        // Check for checkmate or stalemate
        if (chessGame.in_checkmate()) {
            return 'checkmate';
        } else if (chessGame.in_stalemate()) {
            return 'stalemate';
        } else if (chessGame.in_draw()) {
            return 'draw';
        } else if (chessGame.in_check()) {
            return 'check';
        } else {
            return 'ongoing';
        }
    }
};

module.exports = ChessService;
