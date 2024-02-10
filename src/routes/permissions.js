import express from 'express';

import permissionController from '#controllers/permission.controller';
import { checkPermissions, verifyToken, errorHandler } from '#middlewares/index';

const route = express.Router();

route.get('/me', permissionController.getUserPermissions);

route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), errorHandler(permissionController.getAll));

route.put(
  '/',
  verifyToken,
  checkPermissions(['EDIT_PERMISSIONS']),
  errorHandler(permissionController.updatePermissions),
);

export default route;
