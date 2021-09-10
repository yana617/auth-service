module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'users',
      'birthday',
      Sequelize.DATE
    );

  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'users',
      'birthday'
    );
  }
};
