
const Post = require('../models/postModel');
const fs = require('fs');
const path = require('path');

const getAllPosts = async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
};

const createPost = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Please add all required fields' });

    const postData = {
        title,
        description,
        author: req.user.id,
        authorName: req.user.name,
    };

    if (req.file) {
        postData.imageUrl = path.join('uploads', req.file.filename).replace(/\\/g, "/");
    }

    const post = await Post.create(postData);
    res.status(201).json(post);
};

const updatePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
};


const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

    
        await Post.findByIdAndDelete(req.params.id);


        if (post.imageUrl) {
            fs.unlink(path.join('public', post.imageUrl), (err) => {
                if (err) console.error("Could not delete associated image file:", err);
            });
        }


        res.status(200).json({ id: req.params.id, message: 'Post successfully deleted' });

    } catch (error) {
        console.error('Error in deletePost function:', error);
        res.status(500).json({ message: 'Server error during post deletion' });
    }
};

module.exports = { getAllPosts, createPost, updatePost, deletePost };