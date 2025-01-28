const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    author: {type: String},
});
module.exports = mongoose.model('Blog', blogSchema);
