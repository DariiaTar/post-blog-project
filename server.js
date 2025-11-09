// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => console.error('Connection error to MongoDB:', err));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

require('./routes/postRoutes')(app, upload);

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});