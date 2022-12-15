const { Router } = require('express');
const UserController = require('../controllers/userController');
const routerUser = Router();



routerUser.get('/', (req, res) => {
  res.send('Hello World!');
});

routerUser.post('/register', UserController.register);

routerUser.post('/login', UserController.login);


module.exports = routerUser;