const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const aftController = require('../controllers/additionalFieldTemplate.controller');
const validateAft = require('../middlewares/validateAdditionalFieldTemplate');

route.get('/', verifyToken, aftController.getAllAft);
route.post('/', verifyToken, validateAft, aftController.createAft);
route.put('/:id', verifyToken, validateAft, aftController.updateAft);
route.delete('/:id', verifyToken, aftController.deleteAft);

module.exports = route;
