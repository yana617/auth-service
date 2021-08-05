module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false,
    },
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    hash: DataTypes.STRING,
    salt: DataTypes.STRING,
  }, {
    tableName: 'users',
  });

  User.associate = (models) => {
    User.hasMany(models.UserAdditionalField, {
      foreignKey: 'user_id',
      as: 'user_additional_fields',
    });
  };

  return User;
};
