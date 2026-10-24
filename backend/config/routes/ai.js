const express = require('express');
const router = express.Router();
const { draftEmail } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// This route IS protected, so only logged-in BDAs can use your API quota!
router.use(protect);
router.post('/draft-email', draftEmail);

module.exports = router;
