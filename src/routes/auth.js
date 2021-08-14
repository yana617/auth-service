const route = require('express').Router();

const validateUser = require('../middlewares/validateUser');
const authController = require('../controllers/auth.controller');

route.post('/register', validateUser, authController.registerUser);
route.post('/login', authController.loginUser);

module.exports = route;
