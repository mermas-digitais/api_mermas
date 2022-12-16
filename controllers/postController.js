const Post = require('../models/postModel');
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
    console.log("chamei o upload")
    console.log(req.body)
    // try {

    //   // const result = await cloudinaryConfig.uploader.upload(image, {
    //   //   public_id: 'image',
    //   //   width: 500,
    //   //   crop: "scale"



    //   // });
    //   // return res.json(result);
    // } catch (err) {
    //   console.log(err);
    //   return res.status(500).json({ msg: 'Something went wrong' });
    // }
  },


};