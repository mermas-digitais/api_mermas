const Post = require('../models/postModel');
const sharp = require('sharp');
const mongoose = require('mongoose');
const cloudinaryConfig = require('../config/cloudinary.js');
const dayjs = require('dayjs');



async function uploadImage(filesArray) {
  try {
    const files = filesArray;
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
    return images;

  } catch (error) {
    return error;
  }

}


module.exports = {
  createPost: async (req, res) => {
    const { TitlePost, DescriptionPost, PicturePost } = req.body;
    const files = req.files;

    const images = await uploadImage(files);

    console.log(images);
    if (!TitlePost) return res.status(400).send(`Titulo não encontrado`);

    if (!DescriptionPost) return res.status(400).send(`Descrição não encontrada`);

    if (files.length > 5) return res.status(400).send(`Máximo de 5 fotos`);



    const post = await Post.create({
      _id: mongoose.Types.ObjectId(),
      TitlePost,
      DescriptionPost,
      PicturePost: images,
      createPost: Date.now(),
    });
    post.save();
    return res.json(post);

  },

  getPost: async (req, res) => {
    const post = await Post.find();
    return res.json(post);
  },
  getPostById: async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    return res.json({
      createPost: dayjs(post.createPost).format('DD/MM/YYYY'),
      PicturePost: post.PicturePost,
      TitlePost: post.TitlePost,
      DescriptionPost: post.DescriptionPost,
      _id: post._id,
    });
  },

  editPost: async (req, res) => {
    const { id } = req.params;

    const { TitlePost, DescriptionPost, PicturePost } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);



    const post = await Post.findByIdAndUpdate(id, {
      TitlePost,
      DescriptionPost,
      PicturePost,
    }, { new: true });
    return res.json(post);
  },

  deletePost: async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
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
          width: 456, height: 810, crop: "fill"
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