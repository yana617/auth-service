import express from 'express';
import { checkSchema } from 'express-validator';

import authController from '#controllers/auth.controller';
import validateRegisterUser from '#validators/validateRegisterUser';
import validateResetPassword from '#validators/validateResetPassword';
import { userId } from '#utils/validationOptions';
import {
  checkPermissions,
  verifyToken,
  errorHandler,
  checkValidationErrors,
} from '#middlewares';

const route = express.Router();

route.post('/register', validateRegisterUser, checkValidationErrors, errorHandler(authController.registerUser));

route.post('/login', errorHandler(authController.loginUser));

route.post(
  '/forgot-password',
  verifyToken,
  checkPermissions(['EDIT_PERMISSIONS']),
  checkSchema({ userId }),
  checkValidationErrors,
  errorHandler(authController.generateResetLink),
);

route.post(
  '/reset-password',
  validateResetPassword,
  checkValidationErrors,
  errorHandler(authController.resetPassword),
);

export default route;
