const router = require('express').Router();

const authRoute = require('./auth');
const usersRoute = require('./users');

router.use('/auth', authRoute);
router.use('/users', usersRoute);

module.exports = router;
