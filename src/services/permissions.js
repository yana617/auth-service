const permissionRepository = require('../repositories/PermissionRepository');
const { permissionsForbiddenToBeAdditional } = require('../database/constants');
const userPermissionRepository = require('../repositories/UserPermissionRepository');
const roleRepository = require('../repositories/RoleRepository');

exports.getMappedPermissions = async (permissions) => {
  const permissionsToUpdate = await permissionRepository.getByNames(Object.keys(permissions));
  return permissionsToUpdate.map((p) => ({ ...p, value: permissions[p.name] }));
};

exports.createOrDeletePermissions = async (
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

exports.permissionsFromExistingRole = async (
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
  const biggerRoles = mappedRoles.filter((r) => !r.permissionsIds
    .every((v) => rolePermissionsIds.includes(v)) && r.id !== userRoleId);
  const additionalPermissionsIds = mappedPermissionsToUpdate.reduce((filtered, p) => {
    if (p.value) {
      filtered.push(p.id);
    }
    return filtered;
  }, []);
  const newPermissions = rolePermissionsIds
    .concat(userPermissionsIds).concat(additionalPermissionsIds);
  return biggerRoles.some((r) => r.permissionsIds.every((p) => newPermissions.includes(p)));
};
