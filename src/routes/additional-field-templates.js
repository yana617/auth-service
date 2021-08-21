const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const aftController = require('../controllers/additionalFieldTemplate.controller');
const validateAft = require('../middlewares/validateAdditionalFieldTemplate');
const checkPermissions = require('../middlewares/checkPermissions');

route.get('/', verifyToken, aftController.getAllAft);
route.post('/', verifyToken, checkPermissions(['CREATE_ADDITIONAL_FIELD_TEMPLATE']), validateAft, aftController.createAft);
route.put('/:id', verifyToken, checkPermissions(['EDIT_ADDITIONAL_FIELD_TEMPLATE']), validateAft, aftController.updateAft);
route.delete('/:id', verifyToken, checkPermissions(['DELETE_ADDITIONAL_FIELD_TEMPLATE']), aftController.deleteAft);

module.exports = route;
