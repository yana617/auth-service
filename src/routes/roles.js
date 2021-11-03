const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const roleController = require('../controllers/role.controller');
const errorHandler = require('../middlewares/errorHandler');

route.get('/', verifyToken, checkPermissions(['CREATE_CLAIM']), errorHandler(roleController.getAll));

module.exports = route;
