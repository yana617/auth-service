const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const onlyOwnData = require('../middlewares/onlyOwnData');
const validateUser = require('../middlewares/validations/validateUser');
const userController = require('../controllers/user.controller');
const validateUserSearchQuery = require('../middlewares/validations/validateUserSearchQuery');
const checkValidationErrors = require('../middlewares/checkValidation');
const errorHandler = require('../middlewares/errorHandler');

route.get('/me', verifyToken, errorHandler(userController.getMe));
route.get('/:id', verifyToken, checkPermissions(['VIEW_USERS']), errorHandler(userController.getUserById));
route.get('/', verifyToken, checkPermissions(['VIEW_USERS']), validateUserSearchQuery, checkValidationErrors,
  errorHandler(userController.getUsers));
route.get('/:id/permissions', verifyToken, checkPermissions(['EDIT_PERMISSIONS']),
  errorHandler(userController.getUserPermissions));
route.put('/:id', verifyToken, onlyOwnData, validateUser, checkValidationErrors, errorHandler(userController.updateUser));
route.put('/:id/role', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), errorHandler(userController.updateUserRole));

module.exports = route;
