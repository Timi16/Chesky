const express = require('express');
const router = express.Router();
const GameController = require('../controllers/gameController');  // Adjust the path if needed

// Route to make a move in a game
router.post('/move', GameController.makeMove);

// Route to undo the last move in a game
router.post('/undo',GameController.undoMove);

// Route to get the current status of a game
router.get('/:gameId/status',GameController.getGameStatus);

// Export the router
module.exports = router;
