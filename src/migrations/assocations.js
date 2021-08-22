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
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'user_additional_fields',
      'user_id',
    );
  }
};