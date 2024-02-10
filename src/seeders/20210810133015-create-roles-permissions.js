const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

const { NODE_ENV } = process.env;

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

const rolesInDb = {};
const rolesToInsert = roles.map((role) => {
  rolesInDb[role] = v4();
  return {
    id: rolesInDb[role],
    name: role,
    translate: rolesTranslates[role],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

const salt = bcrypt.genSaltSync(10);
const salt2 = bcrypt.genSaltSync(10);
const password = '111111';
const users = [{
  id: v4(),
  name: 'Admin',
  surname: 'Administrator',
  phone: '375291111111',
  email: 'test@example.com',
  birthday: new Date('1980'),
  hash: bcrypt.hashSync(password, salt),
  salt,
  role_id: rolesInDb.ADMIN,
  createdAt: new Date(),
  updatedAt: new Date(),
}, {
  id: v4(),
  name: 'User',
  surname: 'Userski',
  phone: '375291111112',
  email: 'test2@example.com',
  birthday: new Date('1999'),
  hash: bcrypt.hashSync(password, salt2),
  salt: salt2,
  role_id: rolesInDb.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
}];

const usersToInsert = NODE_ENV === 'development' ? users : [];

const permissionsInDb = {};
const permissionsToInsert = permissions.map((permission) => {
  permissionsInDb[permission] = v4();
  return {
    id: permissionsInDb[permission],
    name: permission,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

module.exports = {
  up: async (queryInterface) => Promise.all([
    queryInterface.bulkInsert('roles', rolesToInsert),
    queryInterface.bulkInsert('permissions', permissionsToInsert),
    ...Object.keys(rolePermissions).map((role) => queryInterface
      .bulkInsert('role_permissions', rolePermissions[role].map((permission) => ({
        id: v4(),
        role_id: rolesInDb[role],
        permission_id: permissionsInDb[permission],
        createdAt: new Date(),
        updatedAt: new Date(),
      })))),
    ...(NODE_ENV === 'development' ? [
      queryInterface.bulkInsert('users', usersToInsert),
    ] : []),
  ]),
};
