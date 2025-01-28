const Blog = require('../models/blog');
const Category = require('../models/Category');
const slugify = require('slugify'); 

// Handle GET request for creating a blog
const createBlogPage = async (req, res) => {
    try {
        const categories = await Category.find().select('name');
        res.render('createBlog', { categories, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Handle POST request for creating a blog
const createBlog = async (req, res) => {
    try {
        const { title, description, content, imageUrl, categoryName, newCategory, author } = req.body;

        let category;
        let categoryFilter = '';

        // If a new category is provided, create and save it
        if (newCategory) {
            category = new Category({ name: newCategory });
            await category.save();
        } else {
            // If a category name is provided, find it in the database
            category = await Category.findOne({ name: categoryName });
            if (!category) {
                return res.status(400).send('Category not found, please provide a valid category.');
            }
        }

        // Generate slug from title
        let slug = slugify(title, { lower: true, strict: true });

        // Ensure unique slug by checking if it exists
        let existingBlog = await Blog.findOne({ slug });
        let counter = 1;
        while (existingBlog) {
            slug = `${slug}-${counter}`;
            existingBlog = await Blog.findOne({ slug });
            counter++;
        }

        // Create a new blog with the provided data
        const blog = new Blog({
            title,
            slug,
            description,
            content,
            category: category._id,
            imageUrl,
            author,
        });

        // Save the new blog
        await blog.save();

        // Fetch the list of blogs and categories for the homepage
        const { blogs, totalBlogs, totalPages } = await getBlogsAndCategories(categoryFilter, 1, 5);
        const popularBlogs = await Blog.find().sort({ views: -1 }).limit(5);

        // Render the homepage with the newly created blog added
        res.render('index', { 
            blogs,
            totalBlogs,
            totalPages,
            categories: await Category.find().distinct('name'),
            categoryFilter,
            currentPage: 1,
            popularBlogs,
            user: req.user || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating blog');
    }
};


async function getBlogsAndCategories(categoryFilter = '', page = 1, limit = 5) {
    try {
        const skip = (page - 1) * limit;

        let categoryObjectId = null;
        if (categoryFilter) {
            const category = await Category.findOne({ name: categoryFilter });
            categoryObjectId = category ? category._id : null;
        }

        const query = categoryObjectId ? { category: categoryObjectId } : {};

        const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalBlogs = await Blog.countDocuments(query);

        // Retrieve unique categories for the sidebar
        const categories = await Category.find().distinct('name');

        const totalPages = Math.ceil(totalBlogs / limit);

        return { blogs, categories, totalBlogs, totalPages };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching blogs');
    }
}

// const getBlogById = async (req, res) => {
//     const blogId = req.params.id;
//     const categoryFilter = req.query.category || '';
//     const popularBlogs = await Blog.find().sort({ views: -1 }).limit(5);

//     try {
//         const blog = await Blog.findById(blogId).populate('category');
        
//         if (!blog) {
//             return res.status(404).render('error', { message: 'Blog not found' });
//         }

//         // Fetch the list of categories for the sidebar
//         const categories = await Category.find().distinct('name');

//         // Fetch other blog data (e.g., recent blogs, popular blogs, etc.)
//         const { blogs, totalBlogs, totalPages } = await getBlogsAndCategories(categoryFilter, 1, 5); 

//         const user = req.user || null;

//         res.render('blog', { 
//             blog,
//             categories,
//             categoryFilter,
//             blogs,
//             totalBlogs,
//             totalPages,
//             popularBlogs,
//             user,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//     }
// };


const getBlogBySlug = async (req, res) => {
    const slug = req.params.slug;
    const categoryFilter = req.query.category || ''; 
    const popularBlogs = await Blog.find().sort({ views: -1 }).limit(5);

    try {
        const blog = await Blog.findOne({ slug }).populate('category');
        
        // If the blog is not found, render an error page
        if (!blog) {
            return res.status(404).render('error', { message: 'Blog not found' });
        }

        // Fetch the list of categories for the sidebar
        const categories = await Category.find().distinct('name');

        // Fetch other blog data
        const { blogs, totalBlogs, totalPages } = await getBlogsAndCategories(categoryFilter, 1, 5); 

        const user = req.user || null;

        res.render('blog', { 
            blog,
            categories,
            categoryFilter,
            blogs,
            totalBlogs,
            totalPages,
            popularBlogs,
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};



module.exports = {
    createBlogPage,
    createBlog,
    getBlogsAndCategories,
    // getBlogById,
    getBlogBySlug,
};