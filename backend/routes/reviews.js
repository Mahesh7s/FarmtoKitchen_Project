const express = require('express');
const { createReview, getFarmerReviews } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createReview);
router.get('/farmer/:farmerId', getFarmerReviews);

module.exports = router;