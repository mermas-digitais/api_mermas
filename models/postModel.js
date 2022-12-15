const mongoose = require('mongoose');


const PostSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  TitlePost: { type: String, required: true },
  DescriptionPost: { type: String, required: true },
  PicturePost: { type: Array, required: true },
  createPost: { type: Date, default: Date.now },

});

module.exports = mongoose.model('galleryPost', PostSchema);