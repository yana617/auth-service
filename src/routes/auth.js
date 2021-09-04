const route = require('express').Router();

const validateRegisterUser = require('../middlewares/validateRegisterUser');
const authController = require('../controllers/auth.controller');

route.post('/register', validateRegisterUser, authController.registerUser);
route.post('/login', authController.loginUser);

module.exports = route;
