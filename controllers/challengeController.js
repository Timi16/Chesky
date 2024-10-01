const Challenge = require('../models/Challenge');

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

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || challenge.status !== 'pending') {
        return res.status(404).json({ message: 'Challenge not found or already accepted/declined' });
    }

    challenge.status = 'accepted';
    await challenge.save();

    // Start the game logic
    // Notify players (use WebSocket here)

    res.status(200).json({ message: 'Challenge accepted', challenge });
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
