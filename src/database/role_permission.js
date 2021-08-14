module.exports = (sequelize) => {
  const RolePermission = sequelize.define('RolePermission', {}, {
    tableName: 'role_permissions',
  });

  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
      onDelete: 'CASCADE',
    });
    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'permission_id',
      as: 'permission',
      onDelete: 'CASCADE',
    });
  };

  return RolePermission;
};
