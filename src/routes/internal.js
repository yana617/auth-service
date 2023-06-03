import express from 'express';

import permissionController from '#controllers/permission.controller';
import userController from '#controllers/user.controller';
import internalController from '#controllers/internal.controller';
import validateGuest from '#middlewares/validators/validateGuest';
import {
  verifyToken,
  checkPermissions,
  checkValidationErrors,
  errorHandler,
} from '#middlewares/index';

const route = express.Router();

route.get('/auth', verifyToken, (req, res) => res.json({ success: true }));

route.post('/users', errorHandler(internalController.getUsers));

route.post('/guests', errorHandler(internalController.getGuests));

route.get('/permissions/me', errorHandler(permissionController.getUserPermissions));

route.get('/users/me', verifyToken, errorHandler(userController.getMe));

route.post(
  '/guest',
  verifyToken,
  checkPermissions(['CREATE_CLAIM_FOR_UNREGISTERED_USERS']),
  validateGuest,
  checkValidationErrors,
  errorHandler(internalController.getOrCreateGuest),
);

export default route;
