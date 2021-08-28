const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const uafController = require('../controllers/userAdditionalFields.controller');

route.get('/me', verifyToken, uafController.getMyUaf);
route.put('/:id', verifyToken, uafController.updateMyUaf);

module.exports = route;
