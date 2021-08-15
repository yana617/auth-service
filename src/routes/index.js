const router = require('express').Router();

const authRoute = require('./auth');
const usersRoute = require('./users');
const aftRoute = require('./additional-field-templates');

router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/additional-field-templates', aftRoute);

module.exports = router;
