const { permissions } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    name: {
      type: DataTypes.ENUM(permissions),
      unique: true,
    },
  }, {
    tableName: 'permissions',
  });

  Permission.associate = (models) => {
    Permission.hasMany(models.UserPermission, {
      foreignKey: 'permission_id',
      as: 'user_permissions',
    });
    Permission.hasMany(models.RolePermission, {
      foreignKey: 'permission_id',
      as: 'role_permissions',
    });
  };

  return Permission;
};
