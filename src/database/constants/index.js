const roles = [
  'USER',
  'VOLUNTEER',
  'ADMIN',
];

const permissions = [
  'VIEW_PROFILE',
  'EDIT_PROFILE',
  'CREATE_CLAIM',
  'EDIT_CLAIM',
  'DELETE_CLAIM',
  'VIEW_USERS',
  'CREATE_NOTICE',
  'EDIT_NOTICE',
  'DELETE_NOTICE',
  'CREATE_ADDITIONAL_FIELD_TEMPLATE',
  'EDIT_ADDITIONAL_FIELD_TEMPLATE',
  'DELETE_ADDITIONAL_FIELD_TEMPLATE',
  'EDIT_PERMISSIONS',
];

const rolePermissions = {
  USER: [
    'VIEW_PROFILE',
    'EDIT_PROFILE',
  ],
  VOLUNTEER: [
    'VIEW_PROFILE',
    'EDIT_PROFILE',
    'CREATE_CLAIM',
    'EDIT_CLAIM',
    'DELETE_CLAIM',
    'VIEW_USERS',
  ],
  ADMIN: permissions,
};

const permissionsForbiddenToBeAdditional = [
  'DELETE_ADDITIONAL_FIELD_TEMPLATE',
  'EDIT_PERMISSIONS',
];

const DEFAULT_ROLE = 'USER';

module.exports = {
  roles,
  permissions,
  rolePermissions,
  permissionsForbiddenToBeAdditional,
  DEFAULT_ROLE,
};
