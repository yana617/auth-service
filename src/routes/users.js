const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const models = require('../database');
const { ERRORS } = require('../translations');
const checkPermissions = require('../middlewares/checkPermissions');
const updateOnlyOwnData = require('../middlewares/updateOnlyOwnData');

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

route.put('/:id', verifyToken, updateOnlyOwnData, async (req, res) => {
  const { id: userId } = req.params;
  const {
    email,
    phone,
    name,
    surname,
  } = req.body;

  try {
    const updatedUser = await models.User.update({
      email,
      phone,
      name,
      surname,
    }, { where: { id: userId } });
    return res.json({ success: true, data: updatedUser });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.put('/:id/roles', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  const { id: userToUpdateId } = req.params;
  const { id: userId } = req.user;

  if (userId === userToUpdateId) {
    return res.status(400).json({
      success: false,
      error: 'You can not change your own role',
    });
  }

  const { role } = req.body;
  if (!role) {
    return res.status(400).json({
      success: false,
      error: 'Role field must be provided',
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
