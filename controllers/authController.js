const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { setUser } = require('../service/auth');
const { v4: uuidv4 } = require('uuid');

// Render Login Page
exports.renderLoginPage = (req, res) => {
    const user = req.user || null;
    res.render('login', { message: null, user });
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { message: req.__('login_required'), user: null });
        }

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.render('login', { message: req.__('invalid_credentials'), user: null });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        return res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).render('login', { message: req.__('unexpected_error'), user: null });
    }
};

exports.handleRegister = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role, secretKey } = req.body;

        if (password !== confirmPassword) {
            return res.render('register', { message: req.__('password_mismatch') });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: req.__('user_exists') });
        }

        let userRole = 'user';
        if (role === 'admin') {
            if (secretKey !== process.env.ADMIN_SECRET) {
                return res.render('register', { message: req.__('invalid_secret_key') });
            }
            userRole = 'admin';
        }

        const newUser = new User({ username, email, password, role: userRole });
        await newUser.save();

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send(req.__('unexpected_error'));
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


