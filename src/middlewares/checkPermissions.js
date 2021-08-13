const db = require('../database');
const { ERRORS } = require('../translations');

module.exports = (permissions) => async (req, res, next) => {
  try {
    const { id: userId, role_id } = req.user;

    let permissionsIdsToCheck = await db.Permission.findAll({ where: { name: permissions } });
    permissionsIdsToCheck = permissionsIdsToCheck.map((permission) => permission.id);

    let rolePermissions = await db.RolePermission.findAll({ where: { role_id } });
    rolePermissions = rolePermissions.map((rolePermission) => rolePermission.permission_id);

    let userAdditionalPermissions = await db.UserPermission.findAll({ where: { user_id: userId } });
    userAdditionalPermissions = userAdditionalPermissions.map((uap) => uap.permission_id);

    const allPermissions = rolePermissions.concat(userAdditionalPermissions);
    if (permissionsIdsToCheck.every((p) => allPermissions.includes(p))) {
      return next();
    }
    res.status(403).json({
      success: false,
      error: ERRORS.FORBIDDEN,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
