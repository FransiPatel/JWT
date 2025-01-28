const Blog = require('../models/blog');
const Category = require('../models/Category');
// const User = require('../models/user');


// Admin Dashboard
exports.dashboard = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments();
        const totalCategories = await Category.countDocuments();
        const recentBlogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('category', 'name');
        const recentCategories = await Category.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Pass data to EJS template
        res.render('admin/dashboard', {
            totalBlogs,
            totalCategories,
            recentBlogs,
            recentCategories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get All Blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('category', 'name') // Fetch only the category name
            .sort({ createdAt: -1 }); // Sort by most recent
        res.render('admin/blogs', { user: req.user, blogs });
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).render('error', { message: 'Unable to fetch blogs. Please try again later.' });
    }
};


// Add New Blog - Form
exports.addBlogForm = async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch categories for dropdown
        res.render('admin/addBlog', { user: req.user, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Add New Blog - Save
exports.addBlog = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-'); // Generate slug

        const blog = new Blog({
            title,
            slug,
            description,
            category,
            publishDate: new Date(),
            thumbnail: req.file?.path, // Assuming multer is used for image uploads
        });

        await blog.save();
        res.redirect('/admin/blogs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Edit Blog Form by Slug
exports.editBlogForm = async (req, res) => {
    try {
        const blogSlug = req.params.slug;
        const blog = await Blog.findOne({ slug: blogSlug }).populate('category', 'name');  // Populate category name
        const categories = await Category.find();  // Fetch categories for the dropdown

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        res.render('admin/editBlog', { blog, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update Blog by Slug
exports.updateBlog = async (req, res) => {
    try {
        const blogSlug = req.params.slug;
        const { title, description, content, imageUrl, categoryName, newCategory, author } = req.body;

        let category;

        // Handle new category creation or fetch existing category
        if (newCategory) {
            category = new Category({ name: newCategory });
            await category.save();
        } else if (categoryName) {
            category = await Category.findById(categoryName); // Fetch by ID, not name
        }

        // Find the blog to update
        const blog = await Blog.findOne({ slug: blogSlug });

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Update blog fields
        blog.title = title;
        blog.description = description;
        blog.content = content;
        blog.imageUrl = imageUrl;
        blog.author = author;

        // Update the category if one is found
        if (category) {
            blog.category = category._id;
        }

        // Save the updated blog
        await blog.save();

        // Redirect to the admin blogs list or the updated blog page
        res.redirect(`/admin/blogs`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating blog');
    }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        await Blog.deleteOne({ _id: blogId });
        console.log(`Blog with ID ${blogId} deleted successfully.`);
        res.redirect('/admin/blogs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// Get All Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories
        res.render('admin/categories', { user: req.user, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editCategoryForm = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('admin/editCategory', { category });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categories'); // Redirect back to categories page
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating category');
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categories'); // Redirect to categories page after deletion
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting category');
    }
};

// Render Add Category Form
exports.addCategoryForm = (req, res) => {
    res.render('admin/addCategory'); // This renders the 'addCategory' template
};

// Handle the form submission for adding a category
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).send('Category already exists');
        }

        const category = new Category({ name });
        await category.save();

        res.redirect('/admin/categories'); // Redirect to categories page after adding
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding category');
    }
};
