import permissionRepository from '#repositories/PermissionRepository';
import { permissionsForbiddenToBeAdditional } from '#database/constants';
import userPermissionRepository from '#repositories/UserPermissionRepository';
import rolePermissionRepository from '#repositories/RolePermissionRepository';
import roleRepository from '#repositories/RoleRepository';

const getMappedPermissions = async (permissions) => {
  const permissionsToUpdate = await permissionRepository.getByNames(Object.keys(permissions));
  return permissionsToUpdate.map((p) => ({ ...p, value: permissions[p.name] }));
};

const createOrDeletePermissions = async (
  mappedPermissionsToUpdate,
  userPermissionsIds,
  rolePermissionsIds,
  userId,
) => Promise.all(mappedPermissionsToUpdate.map((permission) => {
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

const permissionsFromExistingRole = async (
  mappedPermissionsToUpdate,
  userPermissionsIds,
  rolePermissionsIds,
  userRoleId,
) => {
  const allRolesWithPermissions = await roleRepository.getAllWithPermissions();
  const mappedRoles = allRolesWithPermissions.map((r) => ({
    name: r.name,
    permissionsIds: r.role_permissions.map((rp) => rp.permission_id),
  }));
  const rolesSeniorThanUserRole = mappedRoles.filter((r) => !r.permissionsIds
    .every((permissionsId) => rolePermissionsIds.includes(permissionsId)) && r.id !== userRoleId);
  const additionalPermissionsIds = mappedPermissionsToUpdate.reduce((filtered, p) => {
    if (p.value) {
      filtered.push(p.id);
    }
    return filtered;
  }, []);
  const newPermissions = rolePermissionsIds
    .concat(userPermissionsIds).concat(additionalPermissionsIds);
  return rolesSeniorThanUserRole.some((r) => r.permissionsIds
    .every((p) => newPermissions.includes(p)));
};

const getAllPermissions = async (userId, roleId) => {
  const userPermissions = await userPermissionRepository.getByUserId(userId);
  const userPermissionsNames = userPermissions.map((up) => up.permission.name);
  const rolePermissions = await rolePermissionRepository.getByRoleId(roleId);
  const rolePermissionsNames = rolePermissions.map((up) => up.permission.name);
  return userPermissionsNames.concat(rolePermissionsNames);
};

export default {
  getMappedPermissions,
  createOrDeletePermissions,
  permissionsFromExistingRole,
  getAllPermissions,
};
