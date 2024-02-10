import express from 'express';

import userController from '#controllers/user.controller';
import validateUser from '#middlewares/validators/validateUser';
import validateUserSearchQuery from '#middlewares/validators/validateUserSearchQuery';
import {
  verifyToken,
  errorHandler,
  checkPermissions,
  checkValidationErrors,
  validateUpdatingOwnData,
} from '#middlewares/index';

const route = express.Router();

route.get('/me', verifyToken, errorHandler(userController.getMe));

route.get('/:id', verifyToken, checkPermissions(['VIEW_USERS']), errorHandler(userController.getUserById));

route.get(
  '/',
  verifyToken,
  checkPermissions(['VIEW_USERS']),
  validateUserSearchQuery,
  checkValidationErrors,
  errorHandler(userController.getUsers),
);

route.get(
  '/:id/permissions',
  verifyToken,
  checkPermissions(['EDIT_PERMISSIONS']),
  errorHandler(userController.getUserPermissions),
);

route.put(
  '/:id',
  verifyToken,
  validateUpdatingOwnData,
  validateUser,
  checkValidationErrors,
  errorHandler(userController.updateUser),
);

route.put(
  '/:id/role',
  verifyToken,
  checkPermissions(['EDIT_PERMISSIONS']),
  errorHandler(userController.updateUserRole),
);

export default route;
