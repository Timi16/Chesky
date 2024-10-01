const User = require('../models/User');

// Search for users by username
exports.searchUsers = async (req, res) => {
    const { username } = req.query;

    const users = await User.find({ username: { $regex: username, $options: 'i' } }).limit(10);
    res.status(200).json({ users });
};
