const Blog = require('../models/blog');
const Category = require('../models/Category');

// Controller for rendering the homepage
exports.getHomePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const categoryFilter = req.query.category || '';  // category filter from query params

        let categoryObjectId = null;
        if (categoryFilter) {
            const category = await Category.findOne({ name: categoryFilter });
            categoryObjectId = category ? category._id : null;
        }

        const query = categoryObjectId ? { category: categoryObjectId } : {};  // Filter blogs by category if selected

        const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalBlogs = await Blog.countDocuments(query);
        const categories = await Category.find().distinct('name');  // List of category names for the dropdown

        const popularBlogs = await Blog.find().sort({ views: -1 }).limit(5);

        const totalPages = Math.ceil(totalBlogs / limit);

        res.render('index', {
            blogs,
            categories,
            currentPage: page,
            totalPages,
            popularBlogs,
            categoryFilter,  // Pass the selected category filter to the view
            user: req.user || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
