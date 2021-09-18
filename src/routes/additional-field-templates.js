const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const aftController = require('../controllers/additionalFieldTemplate.controller');
const validateAft = require('../middlewares/validateAdditionalFieldTemplate');
const checkPermissions = require('../middlewares/checkPermissions');
const errorHandler = require('../middlewares/errorHandler');

route.get('/', aftController.getAllAft);
route.post('/', verifyToken, checkPermissions(['CREATE_ADDITIONAL_FIELD_TEMPLATE']), validateAft, errorHandler(aftController.createAft));
route.put('/:id', verifyToken, checkPermissions(['EDIT_ADDITIONAL_FIELD_TEMPLATE']), validateAft, errorHandler(aftController.updateAft));
route.delete('/:id', verifyToken, checkPermissions(['DELETE_ADDITIONAL_FIELD_TEMPLATE']),
  errorHandler(aftController.deleteAft));

module.exports = route;
