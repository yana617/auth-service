const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const uafController = require('../controllers/userAdditionalFields.controller');
const errorHandler = require('../middlewares/errorHandler');

route.get('/me', verifyToken, errorHandler(uafController.getMyUaf));
route.put('/:id', verifyToken, errorHandler(uafController.updateMyUaf));

module.exports = route;
