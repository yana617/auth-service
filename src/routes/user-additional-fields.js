import express from 'express';

import uafController from '#controllers/userAdditionalFields.controller';
import { verifyToken, errorHandler } from '#middlewares/index';

const route = express.Router();

route.get('/me', verifyToken, errorHandler(uafController.getMyUaf));

route.put('/:id', verifyToken, errorHandler(uafController.updateMyUaf));

export default route;
