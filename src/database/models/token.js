module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    token: DataTypes.STRING,
    expiration: {
      type: DataTypes.DATE,
      defaultValue: new Date(Date.now() + 1000 * 60 * 20),
    },
  }, {
    tableName: 'tokens',
  });

  Token.associate = (models) => {
    Token.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return Token;
};
