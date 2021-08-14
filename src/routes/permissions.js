const route = require('express').Router();

const verifyToken = require('../middlewares/authRequired');
const models = require('../database');
const { ERRORS } = require('../translations');
const checkPermissions = require('../middlewares/checkPermissions');
const { permissionsForbiddenToBeAdditional } = require('../database/constants');

route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  try {
    const permissions = await models.Permission.findAll();
    const permissionsNames = permissions.map((p) => p.name);
    res.json({
      success: true,
      data: permissionsNames.filter((p) => !permissionsForbiddenToBeAdditional.includes(p)),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.put('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  const { userId, permissions } = req.body;
  if (!permissions) {
    return res.status(400).json({
      success: false,
      error: ERRORS.PERMISSIONS_REQUIRED,
    });
  }
  try {
    const user = await models.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    const permissionsToUpdate = await models.Permission
      .findAll({ where: { name: Object.keys(permissions) }, raw: true });
    const mappedPermissionsToUpdate = permissionsToUpdate
      .map((p) => ({ ...p, value: permissions[p.name] }));

    const rolePerms = await models.RolePermission.findAll({ where: { role_id: user.role_id } });
    const rolePermissionsIds = rolePerms.map((p) => p.permission_id);

    const userPermissions = await models.UserPermission.findAll({ where: { user_id: userId } });
    const userPermissionsIds = userPermissions.map((p) => p.permission_id);

    await Promise.all(mappedPermissionsToUpdate.map((permission) => {
      if (permissionsForbiddenToBeAdditional.includes(permission.name)
        || rolePermissionsIds.includes(permission.id)) {
        return null;
      }
      if (userPermissionsIds.includes(permission.id) && !permission.value) {
        return models.UserPermission
          .destroy({ where: { user_id: userId, permission_id: permission.id } });
      }
      if (!userPermissionsIds.includes(permission.id) && permission.value) {
        return models.UserPermission.create({ user_id: userId, permission_id: permission.id });
      }
      return null;
    }));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
