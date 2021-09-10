const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const permissionController = require('../controllers/permission.controller');

route.get('/me', verifyToken, permissionController.getUserPermissions);
route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), permissionController.getAll);
route.put('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), permissionController.updatePermissions);

module.exports = route;
