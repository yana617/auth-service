import express from 'express';

import authRoute from './auth';
import usersRoute from './users';
import permissionsRoute from './permissions';
import rolesRoute from './roles';
import aftRoute from './additional-field-templates';
import uafRoute from './user-additional-fields';
import internalRoute from './internal';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/permissions', permissionsRoute);
router.use('/roles', rolesRoute);
router.use('/additional-field-templates', aftRoute);
router.use('/user-additional-fields', uafRoute);
router.use('/internal', internalRoute);

export default router;
