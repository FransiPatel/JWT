const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth } = require('../middlewares/authenticate');
const { restrictTo } = require('../middlewares/roles');
const blogController = require('../controllers/blogController');


// Middleware
router.use(checkAuth);
router.use(restrictTo('admin'));
router.use(express.urlencoded({ extended: true }));

// Admin Routes
router.get('/', (req, res) => res.redirect('/'));
router.get('/dashboard', adminController.dashboard);
router.get('/blogs', adminController.getAllBlogs);
router.post('/create-blog', blogController.createBlog);
router.get('/blogs/edit/:slug', adminController.editBlogForm);
router.post('/blogs/edit/:slug', adminController.updateBlog);
router.post('/blogs/delete/:id', adminController.deleteBlog);
router.get('/categories', adminController.getAllCategories);
router.get('/categories/edit/:id', adminController.editCategoryForm);
router.post('/categories/edit/:id', adminController.updateCategory);
router.get('/categories/delete/:id', adminController.deleteCategory);
router.get('/categories/add', adminController.addCategoryForm);   
router.post('/categories/add', adminController.addCategory);
module.exports = router;
