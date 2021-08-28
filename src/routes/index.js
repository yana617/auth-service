const router = require('express').Router();

const authRoute = require('./auth');
const usersRoute = require('./users');
const permissionsRoute = require('./permissions');
const rolesRoute = require('./roles');
const aftRoute = require('./additional-field-templates');
const uafRoute = require('./user-additional-fields');

router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/permissions', permissionsRoute);
router.use('/roles', rolesRoute);
router.use('/additional-field-templates', aftRoute);
router.use('/user-additional-fields', uafRoute);

module.exports = router;
