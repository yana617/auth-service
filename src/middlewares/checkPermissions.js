const userPermissionsRepository = require('../repositories/UserPermissionRepository');
const rolePermissionRepository = require('../repositories/RolePermissionRepository');
const { ERRORS } = require('../translations');

module.exports = (permissions) => async (req, res, next) => {
  try {
    const { id: userId, role_id } = req.user;

    const userPermissions = await userPermissionsRepository.getByUserId(userId);
    const userPermissionsNames = userPermissions.map((up) => up.permission.name);
    const rolePermissions = await rolePermissionRepository.getByRoleId(role_id);
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
