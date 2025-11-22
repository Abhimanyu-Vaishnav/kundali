const express = require('express');
const router = express.Router();
const { createKundali, getMyKundalis, getKundaliById, deleteKundali } = require('../controllers/kundaliController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createKundali)
    .get(protect, getMyKundalis);

router.route('/:id')
    .get(protect, getKundaliById)
    .delete(protect, deleteKundali);

module.exports = router;
