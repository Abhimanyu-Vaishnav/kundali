const express = require('express');
const router = express.Router();
const { createMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createMatch);

module.exports = router;
