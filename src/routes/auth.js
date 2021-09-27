const route = require('express').Router();
const { checkSchema } = require('express-validator');

const validateRegisterUser = require('../middlewares/validations/validateRegisterUser');
const validateResetPassword = require('../middlewares/validations/validateResetPassword');
const authController = require('../controllers/auth.controller');
const checkValidationErrors = require('../middlewares/checkValidation');
const errorHandler = require('../middlewares/errorHandler');
const { email } = require('../utils/validationOptions');

route.post('/register', validateRegisterUser, checkValidationErrors, errorHandler(authController.registerUser));
route.post('/login', errorHandler(authController.loginUser));
route.post('/forgot-password', checkSchema({ email }), checkValidationErrors, errorHandler(authController.forgotPassword));
route.post('/reset-password', validateResetPassword, checkValidationErrors, errorHandler(authController.resetPassword));

module.exports = route;
