'use strict';

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

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
      },
      name: {
        type: Sequelize.ENUM(permissions),
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('permissions');
  }
};
