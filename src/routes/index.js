const router = require('express').Router();

const authRoute = require('./auth');
const usersRoute = require('./users');
const aftRoute = require('./additional-field-templates');
const uafRoute = require('./user-additional-fields');

router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/additional-field-templates', aftRoute);
router.use('/user-additional-fields', uafRoute);

module.exports = router;
