const express = require('express');
const router = express.Router();
const { createReview, getLabReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/lab/:labId', getLabReviews);

module.exports = router;
