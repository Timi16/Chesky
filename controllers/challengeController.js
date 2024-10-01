const Challenge = require('../models/Challenge');
const Game = require('../models/Game');
const ChessService = require('../services/chessService');

// Send a challenge to a user
exports.sendChallenge = async (req, res) => {
    const { opponentId } = req.body;
    
    const challenge = new Challenge({
        challenger: req.user.userId,
        opponent: opponentId,
    });

    await challenge.save();

    // Notify the opponent (use WebSocket here)
    // Emit challenge notification

    res.status(201).json({ message: 'Challenge sent', challenge });
};

// Accept a challenge
exports.acceptChallenge = async (req, res) => {
    const { challengeId } = req.body;

    try {
        const challenge = await Challenge.findById(challengeId);
        if (!challenge || challenge.status !== 'pending') {
            return res.status(404).json({ message: 'Challenge not found or already accepted' });
        }

        // Assign players based on preferred color
        const white = challenge.preferredColor === 'white' ? challenge.challenger : challenge.opponent;
        const black = challenge.preferredColor === 'black' ? challenge.challenger : challenge.opponent;

        // Create a new game with the assigned colors and initial game state
        const newGame = new Game({
            players: { white, black },
            currentTurn: 'white',  // White always starts in chess
            board: ChessService.getInitialBoard(),  // Initialize board state from the Chess service
            status: 'ongoing',
            moveHistory: [],  // Start with an empty move history
        });

        // Update challenge status and save both challenge and game
        challenge.status = 'accepted';
        await challenge.save();
        await newGame.save();

        res.status(201).json({
            message: 'Challenge accepted and game started',
            gameId: newGame._id,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Decline a challenge
exports.declineChallenge = async (req, res) => {
    const { challengeId } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || challenge.status !== 'pending') {
        return res.status(404).json({ message: 'Challenge not found or already accepted/declined' });
    }

    challenge.status = 'declined';
    await challenge.save();

    // Notify the challenger (use WebSocket here)

    res.status(200).json({ message: 'Challenge declined', challenge });
};

// Get all challenges for a user
exports.getChallenges = async (req, res) => {
    const challenges = await Challenge.find({ opponent: req.user.userId }).populate('challenger');

    res.status(200).json({ challenges });
};
