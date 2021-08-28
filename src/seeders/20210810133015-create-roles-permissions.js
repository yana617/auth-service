const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

const { roles, permissions, rolePermissions, rolesTranslates } = require('../database/constants');

const { NODE_ENV } = process.env;

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
