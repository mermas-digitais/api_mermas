const Post = require('../models/postModel');
const mongoose = require('mongoose');
module.exports = {
  createPost: async (req, res) => {
    const { TitlePost, DescriptionPost, PicturePost } = req.body;
    const post = await Post.create({
      _id: mongoose.Types.ObjectId(),
      TitlePost,
      DescriptionPost,
      PicturePost,
      createPost: Date.now(),
    });
    post.save();
    return res.json(post);

  },

  getPost: async (req, res) => {
    const post = await Post.find();
    return res.json(post);
  },

};