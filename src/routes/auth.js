const route = require('express').Router();
const { checkSchema } = require('express-validator');

const validateRegisterUser = require('../middlewares/validateRegisterUser');
const validateResetPassword = require('../middlewares/validateResetPassword');
const authController = require('../controllers/auth.controller');
const { email } = require('../utils/validationOptions');

route.post('/register', validateRegisterUser, authController.registerUser);
route.post('/login', authController.loginUser);
route.post('/forgot-password', checkSchema({ email }), authController.forgotPassword);
route.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = route;
