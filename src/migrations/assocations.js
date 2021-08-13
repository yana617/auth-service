module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'user_additional_fields',
        'user_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
      queryInterface.addColumn(
        'user_additional_fields',
        'additional_field_template_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'additional_field_templates',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
      queryInterface.addColumn(
        'users',
        'role_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'roles',
            key: 'id',
          },
        }
      ),
      queryInterface.addColumn(
        'role_permissions',
        'role_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'roles',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
      queryInterface.addColumn(
        'role_permissions',
        'permission_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'permissions',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
      queryInterface.addColumn(
        'user_permissions',
        'user_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
      queryInterface.addColumn(
        'user_permissions',
        'permission_id',
        {
          type: Sequelize.UUID,
          references: {
            model: 'permissions',
            key: 'id',
          },
          onDelete: 'CASCADE',
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'user_additional_fields',
      'user_id',
    );
  }
};