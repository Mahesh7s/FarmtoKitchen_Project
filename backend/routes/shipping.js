const express = require('express');
const { calculateShipping, bookDeliverySlot } = require('../controllers/shippingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/calculate', auth, calculateShipping);
router.post('/book-slot', auth, bookDeliverySlot);

module.exports = router;