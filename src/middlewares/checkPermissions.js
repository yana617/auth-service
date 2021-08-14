const db = require('../database');
const { ERRORS } = require('../translations');

module.exports = (permissions) => async (req, res, next) => {
  try {
    const { id: userId, role_id } = req.user;

    const userPermissions = await db.UserPermission.findAll({ where: { user_id: userId }, include: ['permission'] });
    const userPermissionsNames = userPermissions.map((up) => up.permission.name);
    const rolePermissions = await db.RolePermission.findAll({ where: { role_id }, include: ['permission'] });
    const rolePermissionsNames = rolePermissions.map((up) => up.permission.name);

    const allPermissions = userPermissionsNames.concat(rolePermissionsNames);
    if (permissions.every((p) => allPermissions.includes(p))) {
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
