const Blog = require('../models/blog');
const Category = require('../models/Category');
const { getBlogsAndCategories } = require('./blogController');

exports.getSearch = async (req, res) => {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const categoryFilter = req.query.category || ''; 
    const popularBlogs = await Blog.find().sort({ views: -1 }).limit(5);
    

    try {
        const blogs = await Blog.find({ 
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive title match
                { content: { $regex: query, $options: 'i' } } // Case-insensitive content match
            ]
        }).populate('category');

        const { categories, totalBlogs, totalPages } = await getBlogsAndCategories(categoryFilter, page, limit);
        res.render('search', { 
            query, 
            blogs, 
            categories, 
            totalBlogs, 
            totalPages, 
            currentPage: page,
            categoryFilter,
            popularBlogs,
            user: req.user || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
