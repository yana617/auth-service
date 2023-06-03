import express from 'express';

import roleController from '#controllers/role.controller';
import { checkPermissions, verifyToken, errorHandler } from '#middlewares/index';

const route = express.Router();

route.get('/', verifyToken, checkPermissions(['CREATE_CLAIM']), errorHandler(roleController.getAll));

export default route;
