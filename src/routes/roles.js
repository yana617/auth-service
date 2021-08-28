const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const roleController = require('../controllers/role.controller');

route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), roleController.getAll);

module.exports = route;
