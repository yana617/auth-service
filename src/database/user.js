module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
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
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });
    User.hasMany(models.UserPermission, {
      foreignKey: 'user_id',
      as: 'user_permissions',
    });
  };

  return User;
};
