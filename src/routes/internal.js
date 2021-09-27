const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const permissionController = require('../controllers/permission.controller');
const userController = require('../controllers/user.controller');
const internalController = require('../controllers/internal.controller');
const checkPermissions = require('../middlewares/checkPermissions');
const validateGuest = require('../middlewares/validations/validateGuest');
const checkValidationErrors = require('../middlewares/checkValidation');
const errorHandler = require('../middlewares/errorHandler');

route.get('/auth', verifyToken, (req, res) => res.json({ success: true }));
route.post('/users', errorHandler(internalController.getUsers));
route.post('/guests', errorHandler(internalController.getGuests));
route.get('/permissions/me', errorHandler(permissionController.getUserPermissions));
route.get('/users/me', verifyToken, errorHandler(userController.getMe));
route.post('/guest', verifyToken, checkPermissions(['CREATE_CLAIM_FOR_UNREGISTERED_USERS']),
  validateGuest, checkValidationErrors, errorHandler(internalController.getOrCreateGuest));

module.exports = route;
