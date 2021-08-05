module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
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
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'user_additional_fields',
      'user_id',
    );
  }
};