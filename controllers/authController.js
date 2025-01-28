const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { setUser } = require('../service/auth');
const { v4: uuidv4 } = require('uuid');

// Render Login Page
exports.renderLoginPage = (req, res) => {
    const user = req.user || null;
    res.render('login', { message: null, user });
};


// controllers/authController.js
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if both email and password are provided
        if (!email || !password) {
            return res.render('login', { message: 'Email and password are required', user: null });
        }

        const user = await User.findOne({ email, password });

        if (!user) {
            // If user not found, return to login with error
            return res.render('login', { message: 'Invalid Username or Password', user: null });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.cookie('token', token, { httpOnly: true });

        return res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).render('login', { message: 'An unexpected error occurred', user: null });
    }
};

// Handle Logout
exports.logout = (req, res) => {
    res.clearCookie('uid');
    return res.redirect('/login');
};

// Render Register Page
exports.renderRegisterPage = (req, res) => {
    res.render('register', { message: null });
};


exports.handleRegister = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role, secretKey } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.render('register', { message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: 'User already exists' });
        }

        // Allow admin creation only with a valid secret key
        let userRole = 'user';
        if (role === 'admin') {
            if (secretKey !== process.env.ADMIN_SECRET) {
                return res.render('register', { message: 'Invalid secret key for admin registration' });
            }
            userRole = 'admin';
        }

        // Create and save the new user
        const newUser = new User({ username, email, password, role: userRole });
        await newUser.save();

        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};