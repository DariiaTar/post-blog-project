// controllers/postController.js

const Post = require('../models/postModel');
const fs = require('fs'); // Вбудований модуль Node.js для роботи з файловою системою
const path = require('path');

// --- GET ALL POSTS (READ) ---
const getAllPosts = async (req, res) => {
  try {
   // Sort by creation date so that the newest are on top
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера: " + error.message });
  }
};

// --- CREATE A NEW POST ---
const createPost = async (req, res) => {
  try {
    const postData = {
      title: req.body.title,
      description: req.body.description,
      author: req.body.author,
    };

    // If multer uploaded a file, add its path to the data
    if (req.file) {
      // We store the relative path
      postData.imageUrl = path.join('uploads', req.file.filename).replace(/\\/g, "/");
    }

    const post = await Post.create(postData);
    res.status(201).json(post);

  } catch (error) {
    res.status(400).json({ message: "Помилка валідації: " + error.message });
  }
};

// UPDATE
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postToUpdate = await Post.findById(id);

    if (!postToUpdate) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // Updating text data
    postToUpdate.title = req.body.title;
    postToUpdate.description = req.body.description;
    postToUpdate.author = req.body.author;

    // Checking if a new file has been uploaded
    if (req.file) {
    // If the post already had an old image, delete it
      if (postToUpdate.imageUrl) {
        fs.unlink(path.join('public', postToUpdate.imageUrl), (err) => {
          if (err) console.error("Не вдалося видалити старий файл:", err);
        });
      }
      // Assign the path to the new picture
      postToUpdate.imageUrl = path.join('uploads', req.file.filename).replace(/\\/g, "/");
    }

    const updatedPost = await postToUpdate.save();
    res.status(200).json(updatedPost);

  } catch (error) {
    res.status(400).json({ message: "Помилка оновлення: " + error.message });
  }
};

// --- DELETE POST ---
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // If the post has a picture, delete the corresponding file
    if (post.imageUrl) {
      fs.unlink(path.join('public', post.imageUrl), (err) => {
        if (err) console.error("Не вдалося видалити файл:", err);
      });
    }

    await Post.findByIdAndDelete(id);
    res.status(204).send(); // 204 No Content - successful deletion with no response body

  } catch (error) {
    res.status(500).json({ message: "Помилка сервера при видаленні: " + error.message });
  }
};


module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
};