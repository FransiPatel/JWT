const express = require('express');
const authController = require('../controllers/authController');
const { restrictToLoggedinUserOnly } = require('../middlewares/authenticate');
const router = express.Router();

// Login Routes
router.get('/login', authController.renderLoginPage);
router.post('/api/auth/login', authController.login);   

// Logout Route
router.get('/logout', authController.logout);       
// Register Routes
router.get('/register', authController.renderRegisterPage); 
router.post('/register', authController.handleRegister);    

router.get('/protected', restrictToLoggedinUserOnly, (req, res) => {
    res.send('This is a protected route');
});


module.exports = router;