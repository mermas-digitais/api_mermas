const Post = require('../models/postModel');
const sharp = require('sharp');
const mongoose = require('mongoose');
const cloudinaryConfig = require('../config/cloudinary.js');
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

  uploadImage: async (req, res) => {
    try {
      const files = req.files;
      const images = [];
      for (const file of files) {
        const base64 = file.buffer.toString('base64');
        const uploadStr = "data:image/png;base64," + base64;
        const { secure_url } = await cloudinaryConfig.uploader.upload(uploadStr, {
          overwrite: true,
          invalidate: true,
          width: 810, height: 456, crop: "fill"
        });
        images.push({
          url: secure_url,
          public_id: secure_url
        });
      }
      return res.json(
        {
          images: images,
          msg: 'Images uploaded successfully'
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Something went wrong' });
    }
  },


};