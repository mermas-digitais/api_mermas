
const { Router } = require('express');
const PostController = require('../controllers/postController');
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to my API' });
});

router.post('/createPost', PostController.createPost);


module.exports = router;