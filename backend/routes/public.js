const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/publicController');

// This route does NOT have 'protect' middleware, so anyone can use it!
router.post('/contact', submitContactForm);

module.exports = router;
