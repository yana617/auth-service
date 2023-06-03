import { ERRORS, PERMISSIONS } from '#translations';
import authService from '#services/auth';
import userRepository from '#repositories/UserRepository';
import permissionRepository from '#repositories/PermissionRepository';
import rolePermissionRepository from '#repositories/RolePermissionRepository';
import userPermissionRepository from '#repositories/UserPermissionRepository';
import { permissionsForbiddenToBeAdditional } from '#database/constants';
import permissionsService from '#services/permissions';

const getAll = async (req, res) => {
  const permissions = await permissionRepository.getAll();
  const permissionsNames = permissions
    .map((p) => ({ name: p.name, translate: PERMISSIONS[p.name] }));
  res.json({
    success: true,
    data: permissionsNames.filter((p) => !permissionsForbiddenToBeAdditional.includes(p.name)),
  });
};

const updatePermissions = async (req, res) => {
  const { userId, permissions } = req.body;
  if (!permissions) {
    return res.status(400).json({
      success: false,
      error: ERRORS.PERMISSIONS_REQUIRED,
    });
  }

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
};

const getUserPermissions = async (req, res) => {
  if (!authService.isAuthorized(req)) {
    return res.json({ success: true, data: [] });
  }

  const { id: userId, role_id: roleId } = req.user;
  const allPermissions = await permissionsService.getAllPermissions(userId, roleId);
  res.json({ success: true, data: allPermissions });
};

export default {
  getAll,
  updatePermissions,
  getUserPermissions,
};
