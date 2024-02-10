import express from 'express';

import aftController from '#controllers/additionalFieldTemplate.controller';
import validateAft from '#validators/validateAdditionalFieldTemplate';
import {
  verifyToken,
  checkPermissions,
  checkValidationErrors,
  errorHandler,
} from '#middlewares/index';

const route = express.Router();

route.get('/', aftController.getAllAft);

route.post(
  '/',
  verifyToken,
  checkPermissions(['CREATE_ADDITIONAL_FIELD_TEMPLATE']),
  validateAft,
  checkValidationErrors,
  errorHandler(aftController.createAft),
);

route.put(
  '/:id',
  verifyToken,
  checkPermissions(['EDIT_ADDITIONAL_FIELD_TEMPLATE']),
  validateAft,
  checkValidationErrors,
  errorHandler(aftController.updateAft),
);

route.delete(
  '/:id',
  verifyToken,
  checkPermissions(['DELETE_ADDITIONAL_FIELD_TEMPLATE']),
  errorHandler(aftController.deleteAft),
);

export default route;
