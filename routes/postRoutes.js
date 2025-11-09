// routes/postRoutes.js

const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');


module.exports = function(app, upload) {
     
    // Route to get all posts
    app.get('/api/posts', getAllPosts);

    // Route for creating a new post with a single file from the 'image' field
    app.post('/api/posts', upload.single('image'), createPost);

    // Route for updating the post
    app.put('/api/posts/:id', upload.single('image'), updatePost);

    // Route for deleting a post
    app.delete('/api/posts/:id', deletePost);
};