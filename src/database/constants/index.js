// KEEP SYNC WITH MIGRATION FILES -create-role.js, -create-roles-permissions.js
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
  'VIEW_ANIMALS',
  'EDIT_ANIMAL',
  'CREATE_ANIMAL',
  'DELETE_ANIMAL',
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
    'VIEW_ANIMALS',
  ],
  ADMIN: permissions,
};

const permissionsForbiddenToBeAdditional = [
  'DELETE_ADDITIONAL_FIELD_TEMPLATE',
  'EDIT_PERMISSIONS',
  'DELETE_ANIMAL',
];

const DEFAULT_ROLE = 'USER';
const DEFAULT_LIMIT = 15;
const availableSortByNames = ['name', 'surname', 'phone', 'createdAt'];
const availableOrder = ['asc', 'desc'];

export {
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
