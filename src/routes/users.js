const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const validateUserSearchQuery = require('../middlewares/validateUserSearchQuery');

route.get('/me', verifyToken, userController.getMe);
route.get('/', verifyToken, validateUserSearchQuery, userController.getUsers);

module.exports = route;
