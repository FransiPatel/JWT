const express = require('express');
const contactController = require('../controllers/contactController');
const router = express.Router();

router.post('/contact', contactController.submitContactForm);

router.get('/contact', (req, res) => {
    res.render('contact', { user: req.user || null });
});


router.get('/about', (req, res) => {
    res.render('about', { user: req.user || null });
});


module.exports = router;
