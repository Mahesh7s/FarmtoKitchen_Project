const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/send', sendContactEmail);

module.exports = router;