const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticateToken } = require('../middlewares/authenticate');

// Route to render the blog creation page
router.get('/create-blog',authenticateToken, blogController.createBlogPage);

// Route to handle form submission for creating a new blog
router.post('/create-blog', blogController.createBlog);

// Route to fetch blog
router.get('/blog/:slug', blogController.getBlogBySlug);

// router.get('/create-blog', authenticateToken, (req, res) => {
//     const { password, ...userWithoutPassword } = req.user.toObject(); // Exclude password
//     res.json({
//         message: 'This route is private.',
//         user: userWithoutPassword,
//     });
// });
module.exports = router;
