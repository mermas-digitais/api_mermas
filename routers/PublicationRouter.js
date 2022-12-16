
const { Router } = require('express');
const PostController = require('../controllers/postController');
const verifyToken = require('./middleware');
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to my API' });
});
router.post('/createPost', verifyToken, PostController.createPost);

router.get('/getPost', PostController.getPost);



module.exports = router;