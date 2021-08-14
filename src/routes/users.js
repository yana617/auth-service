const route = require('express').Router();
const { validationResult } = require('express-validator');

const verifyToken = require('../middlewares/authRequired');
const models = require('../database');
const { ERRORS } = require('../translations');
const checkPermissions = require('../middlewares/checkPermissions');
const updateOnlyOwnData = require('../middlewares/updateOnlyOwnData');
const validateUser = require('../middlewares/validateUser');

// TO-DO-v2 users access
route.get('/:id', verifyToken, updateOnlyOwnData, checkPermissions(['VIEW_USERS']), async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await models.User.findByPk(userId, { attributes: { exclude: ['hash', 'salt'] }, raw: true });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.get('/:id/permissions', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  try {
    const { id: user_id } = req.params;
    const user = await models.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    let rolePermissionsIds = await models.RolePermission
      .findAll({ where: { role_id: user.role_id } });
    rolePermissionsIds = rolePermissionsIds.map((rolePermission) => rolePermission.permission_id);
    let additionalPermissions = await models.UserPermission.findAll({ where: { user_id } });
    additionalPermissions = additionalPermissions.map((p) => p.permission_id);
    const allPermissionsIds = rolePermissionsIds.concat(additionalPermissions);
    const allPermissions = await models.Permission.findAll({ where: { id: allPermissionsIds } });
    res.json({
      success: true,
      data: {
        rolePermissions: allPermissions.filter((p) => rolePermissionsIds.includes(p.id))
          .map((p) => p.name),
        additionalPermissions: allPermissions.filter((p) => additionalPermissions.includes(p.id))
          .map((p) => p.name),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.put('/:id', verifyToken, updateOnlyOwnData, validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id: userId } = req.params;
  const {
    email,
    phone,
    name,
    surname,
  } = req.body;

  try {
    const updatesInfo = await models.User.update({
      email,
      phone,
      name,
      surname,
    }, {
      where: { id: userId },
      returning: true,
      plain: true,
      raw: true,
    });
    const user = updatesInfo[1];
    delete user.hash;
    delete user.salt;
    return res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.put('/:id/role', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  const { id: userToUpdateId } = req.params;
  const { id: userId } = req.user;

  if (userId === userToUpdateId) {
    return res.status(403).json({
      success: false,
      error: ERRORS.UPDATE_OWN_ROLE_FORBIDDEN,
    });
  }

  const { role } = req.body;
  if (!role) {
    return res.status(400).json({
      success: false,
      error: ERRORS.ROLE_REQUIRED,
    });
  }
  try {
    const roleToSet = await models.Role.findOne({ where: { name: role } });
    if (!roleToSet) {
      return res.status(403).json({
        success: false,
        error: ERRORS.FORBIDDEN,
      });
    }

    const user = await models.User.findByPk(userToUpdateId);
    if (!user) {
      return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    await models.User.update({ role_id: roleToSet.id }, { where: { id: userToUpdateId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
