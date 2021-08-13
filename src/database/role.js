const { roles } = require('./constants');

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.ENUM(roles),
      unique: true,
    },
  }, {
    tableName: 'roles',
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users',
    });
    Role.hasMany(models.RolePermission, {
      foreignKey: 'role_id',
      as: 'role_permissions',
    });
  };

  return Role;
};
