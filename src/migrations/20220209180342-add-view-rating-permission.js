'use strict';

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

const newPermissions = previousPermissions.concat([newPermission]);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'permissions',
      'name',
      {
        type: Sequelize.TEXT,
      },
    );
    await queryInterface.sequelize.query('drop type enum_permissions_name;')
      .then(() => queryInterface.changeColumn(
        'permissions',
        'name',
        {
          type: Sequelize.ENUM(...newPermissions),
        },
      ));
  },

  async down({ sequelize: { query } }, Sequelize) {
    await queryInterface.changeColumn(
      'permissions',
      'name',
      {
        type: Sequelize.TEXT,
      },
    );
    await queryInterface.sequelize.query('drop type enum_permissions_name;')
      .then(() => queryInterface.changeColumn(
        'permissions',
        'name',
        {
          type: Sequelize.ENUM(...previousPermissions),
        },
      ));
  },
};
