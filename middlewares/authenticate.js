
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getUser } = require('../service/auth');


exports.restrictToLoggedinUserOnly = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
      console.log('No token provided');
      return res.redirect('/login');
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      const user = await User.findById(decoded.userId);

      if (!user) {
          console.log('User not found for token');
          return res.redirect('/login');
      }

      req.user = user;
      next();
  } catch (err) {
      console.error('JWT error:', err.message);
      return res.redirect('/login');
  }
};

exports.checkAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
      req.user = null;
      return next();
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
          req.user = null;
          return next();
      }

      req.user = user;
      next();
  } catch (err) {
      console.error(err);
      req.user = null;
      next();
  }
};

exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1]; // Check token in cookies or Authorization header

  if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database (optional, if you need user data)
      const user = await User.findById(decoded.userId);
      if (!user) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Attach user to the request object
      req.user = user;
      next();
  } catch (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};