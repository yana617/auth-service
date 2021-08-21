const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const onlyOwnData = require('../middlewares/onlyOwnData');
const validateUser = require('../middlewares/validateUser');
const userController = require('../controllers/user.controller');
const validateUserSearchQuery = require('../middlewares/validateUserSearchQuery');

route.get('/me', verifyToken, userController.getMe);
route.get('/:id', verifyToken, checkPermissions(['VIEW_USERS']), userController.getUserById);
route.get('/', verifyToken, checkPermissions(['VIEW_USERS']), validateUserSearchQuery, userController.getUsers);
route.get('/:id/permissions', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), userController.getUserPermissions);
route.put('/:id', verifyToken, onlyOwnData, validateUser, userController.updateUser);
route.put('/:id/role', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), userController.updateUserRole);

module.exports = route;
