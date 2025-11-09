const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Будь ласка, додайте заголовок'], 
    trim: true 
  },
  description: {
    type: String,
    required: [true, 'Будь ласка, додайте опис']
  },
  author: {
    type: String,
    required: [true, 'Будь ласка, вкажіть автора']
  },
  imageUrl: {
    type: String,
    required: false
} 
},{
  timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);