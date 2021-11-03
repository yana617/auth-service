const userRepository = require('../repositories/UserRepository');
const rolePermissionRepository = require('../repositories/RolePermissionRepository');
const userPermissionRepository = require('../repositories/UserPermissionRepository');
const roleRepository = require('../repositories/RoleRepository');
const { DEFAULT_LIMIT } = require('../database/constants');
const { ERRORS } = require('../translations');
const { sendHistoryAction } = require('../utils/emitHistoryAction');

const getMe = async (req, res) => {
  const { id } = req.user;
  const user = await userRepository.getByIdWithoutSaltHash(id);
  res.json({ success: true, data: user });
};

const updateUser = async (req, res) => {
  const { id: userId } = req.params;
  const {
    email,
    phone,
    name,
    surname,
    birthday,
  } = req.body;

  const updatesInfo = await userRepository.updateById(userId, {
    email,
    phone,
    name,
    surname,
    birthday,
  });
  const user = updatesInfo[1];
  delete user.hash;
  delete user.salt;
  return res.json({ success: true, data: user });
};

const getUserById = async (req, res) => {
  const { id: userId } = req.params;
  const user = await userRepository.getByIdWithoutSaltHash(userId, true);
  if (!user) {
    return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
  }
  res.json({ success: true, data: { ...user, role: user.role.name } });
};

const getUsers = async (req, res) => {
  const {
    sortBy = 'name',
    order = 'ASC',
    limit = DEFAULT_LIMIT,
    skip = 0,
    search = '',
    roles: rolesNames = [],
  } = req.query;

  const roles = await roleRepository.getByNames(rolesNames);
  const rolesIds = roles.length !== 0 ? roles.map((role) => role.id) : null;

  const users = await userRepository.getAllFiltered({
    sortBy,
    order,
    limit,
    skip,
    search,
    roles: rolesIds,
  });
  const total = await userRepository.getCountFiltered({ search, roles: rolesIds });

  res.json({ success: true, data: { users, total } });
};

const getUserPermissions = async (req, res) => {
  const { id: userId } = req.params;
  const user = await userRepository.getById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
  }

  const rolePermissions = await rolePermissionRepository.getByRoleId(user.role_id);
  const userPermissions = await userPermissionRepository.getByUserId(user.id);
  res.json({
    success: true,
    data: {
      userPermissions: userPermissions.map((up) => up.permission.name),
      rolePermissions: rolePermissions.map((rp) => rp.permission.name),
    },
  });
};

const updateUserRole = async (req, res) => {
  const { id: userToUpdateId } = req.params;
  const { id: userId } = req.user;

  if (userId === userToUpdateId) {
    return res.status(403).json({
      success: false,
      error: ERRORS.UPDATE_OWN_ROLE_FORBIDDEN,
    });
  }

  const { role } = req.body;
  if (!role) {
    return res.status(400).json({
      success: false,
      error: ERRORS.ROLE_REQUIRED,
    });
  }
  const roleToSet = await roleRepository.getByName(role, true);
  if (!roleToSet) {
    return res.status(403).json({
      success: false,
      error: ERRORS.FORBIDDEN,
    });
  }

  const user = await userRepository.getById(userToUpdateId);
  if (!user) {
    return res.status(404).json({ success: false, error: ERRORS.USER_NOT_FOUND });
  }

  const newRolePermsIds = roleToSet.role_permissions.map((rp) => rp.permission_id);
  await userPermissionRepository.deleteByUserIdAndPermissionId(user.id, newRolePermsIds);
  await userRepository.updateById(user.id, { role_id: roleToSet.id });

  sendHistoryAction({
    action_type: 'EDIT_ROLE',
    user_from_id: userId,
    user_to_id: userToUpdateId,
    new_role: roleToSet.name,
  });

  res.json({ success: true });
};

module.exports = {
  getMe,
  updateUser,
  getUsers,
  getUserById,
  getUserPermissions,
  updateUserRole,
};
