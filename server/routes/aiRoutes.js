const express = require('express');
const router = express.Router();
const { chatWithAIAstrologer, getSuggestedQuestions } = require('../controllers/aiController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/chat', optionalProtect, chatWithAIAstrologer);
router.get('/suggested-questions', getSuggestedQuestions);

module.exports = router;
