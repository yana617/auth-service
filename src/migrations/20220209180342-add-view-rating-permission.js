'use strict';
const replaceEnum = require('sequelize-replace-enum-postgres').default;

const previousPermissions = [
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

const newPermission = 'VIEW_RATING';

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'permissions',
      columnName: 'name',
      newValues: previousPermissions.concat([newPermission]),
    });
  },

  async down(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'permissions',
      columnName: 'name',
      newValues: previousPermissions,
    });
  },
};
