const router = require('express').Router();

const authRoute = require('./auth');
const usersRoute = require('./users');
const permissionsRoute = require('./permissions');
const rolesRoute = require('./roles');

router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/permissions', permissionsRoute);
router.use('/roles', rolesRoute);

module.exports = router;
