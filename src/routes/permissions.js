const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const permissionController = require('../controllers/permission.controller');
const errorHandler = require('../middlewares/errorHandler');

route.get('/me', permissionController.getUserPermissions);
route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), errorHandler(permissionController.getAll));
route.put('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), errorHandler(permissionController.updatePermissions));

module.exports = route;
