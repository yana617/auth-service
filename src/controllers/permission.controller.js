const { ERRORS, PERMISSIONS } = require('../translations');
const userRepository = require('../repositories/UserRepository');
const permissionRepository = require('../repositories/PermissionRepository');
const rolePermissionRepository = require('../repositories/RolePermissionRepository');
const userPermissionRepository = require('../repositories/UserPermissionRepository');
const { permissionsForbiddenToBeAdditional } = require('../database/constants');
const permissionsService = require('../services/permissions');

const getAll = async (req, res) => {
  try {
    const permissions = await permissionRepository.getAll();
    const permissionsNames = permissions
      .map((p) => ({ name: p.name, translate: PERMISSIONS[p.name] }));
    res.json({
      success: true,
      data: permissionsNames.filter((p) => !permissionsForbiddenToBeAdditional.includes(p.name)),
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

    const mappedPermissionsToUpdate = await permissionsService.getMappedPermissions(permissions);
    const rolePerms = await rolePermissionRepository.getByRoleId(user.role_id);
    const rolePermissionsIds = rolePerms.map((p) => p.permission_id);
    const userPermissions = await userPermissionRepository.getByUserId(user.id);
    const userPermissionsIds = userPermissions.map((p) => p.permission_id);

    const roleExist = await permissionsService.permissionsFromExistingRole(
      mappedPermissionsToUpdate,
      userPermissionsIds,
      rolePermissionsIds,
      user.role_id,
    );
    if (roleExist) {
      return res.status(400).json({
        success: false,
        error: ERRORS.ROLE_WITH_SAME_PERMISSIONS_EXIST,
      });
    }

    await permissionsService.createOrDeletePermissions(
      mappedPermissionsToUpdate,
      userPermissionsIds,
      rolePermissionsIds,
      userId,
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getAll,
  updatePermissions,
};
