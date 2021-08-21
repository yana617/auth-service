const { ERRORS } = require('../translations');
const userRepository = require('../repositories/UserRepository');
const permissionRepository = require('../repositories/PermissionRepository');
const rolePermissionRepository = require('../repositories/RolePermissionRepository');
const userPermissionRepository = require('../repositories/UserPermissionRepository');
const { permissionsForbiddenToBeAdditional } = require('../database/constants');

const getAll = async (req, res) => {
  try {
    const permissions = await permissionRepository.getAll();
    const permissionsNames = permissions.map((p) => p.name);
    res.json({
      success: true,
      data: permissionsNames.filter((p) => !permissionsForbiddenToBeAdditional.includes(p)),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const updatePermissions = async (req, res) => {
  const { userId, permissions } = req.body;
  if (!permissions) {
    return res.status(400).json({
      success: false,
      error: ERRORS.PERMISSIONS_REQUIRED,
    });
  }
  try {
    const user = await userRepository.getById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    const permissionsToUpdate = await permissionRepository.getByNames(Object.keys(permissions));
    const mappedPermissionsToUpdate = permissionsToUpdate
      .map((p) => ({ ...p, value: permissions[p.name] }));

    const rolePerms = await rolePermissionRepository.getByRoleId(user.role_id);
    const rolePermissionsIds = rolePerms.map((p) => p.permission_id);

    const userPermissions = await userPermissionRepository.getByUserId(user.id);
    const userPermissionsIds = userPermissions.map((p) => p.permission_id);

    await Promise.all(mappedPermissionsToUpdate.map((permission) => {
      if (permissionsForbiddenToBeAdditional.includes(permission.name)
        || rolePermissionsIds.includes(permission.id)) {
        return null;
      }
      if (userPermissionsIds.includes(permission.id) && !permission.value) {
        return userPermissionRepository.deleteByUserIdAndPermissionId(userId, permission.id);
      }
      if (!userPermissionsIds.includes(permission.id) && permission.value) {
        return userPermissionRepository.create({ user_id: userId, permission_id: permission.id });
      }
      return null;
    }));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getAll,
  updatePermissions,
};
