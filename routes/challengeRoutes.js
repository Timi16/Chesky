const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.post('/send', challengeController.sendChallenge);
router.post('/accept', challengeController.acceptChallenge);
router.post('/decline', challengeController.declineChallenge);
router.get('/', challengeController.getChallenges);

module.exports = router;
