const roles = [
  'USER',
  'VOLUNTEER',
  'ADMIN',
];
const rolesTranslates = {
  USER: 'Пользователь',
  VOLUNTEER: 'Волонтер',
  ADMIN: 'Администратор',
};

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
  'CREATE_CLAIM_FOR_UNREGISTERED_USERS',
  'VIEW_RATING',
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
    'VIEW_RATING',
  ],
  ADMIN: permissions,
};

const permissionsForbiddenToBeAdditional = [
  'DELETE_ADDITIONAL_FIELD_TEMPLATE',
  'EDIT_PERMISSIONS',
];

const DEFAULT_ROLE = 'USER';
const DEFAULT_LIMIT = 15;
const availableSortByNames = ['name', 'surname', 'phone'];
const availableOrder = ['asc', 'desc'];

module.exports = {
  roles,
  permissions,
  rolePermissions,
  permissionsForbiddenToBeAdditional,
  DEFAULT_ROLE,
  DEFAULT_LIMIT,
  availableSortByNames,
  availableOrder,
  rolesTranslates,
};
