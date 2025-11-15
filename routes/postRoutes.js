const express = require('express');
const router = express.Router();
const { getAllPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAllPosts).post(protect, createPost);
router.route('/:id').delete(protect, deletePost).put(protect, updatePost);

module.exports = router;