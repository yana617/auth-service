const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

route.get('/me', verifyToken, userController.getMe);

module.exports = route;
