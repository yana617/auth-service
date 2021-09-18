const route = require('express').Router();
const { checkSchema } = require('express-validator');

const validateRegisterUser = require('../middlewares/validateRegisterUser');
const validateResetPassword = require('../middlewares/validateResetPassword');
const authController = require('../controllers/auth.controller');
const errorHandler = require('../middlewares/errorHandler');
const { email } = require('../utils/validationOptions');

route.post('/register', validateRegisterUser, errorHandler(authController.registerUser));
route.post('/login', errorHandler(authController.loginUser));
route.post('/forgot-password', checkSchema({ email }), errorHandler(authController.forgotPassword));
route.post('/reset-password', validateResetPassword, errorHandler(authController.resetPassword));

module.exports = route;
