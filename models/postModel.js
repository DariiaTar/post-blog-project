
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    authorName: { type: String, required: true },
    imageUrl: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);