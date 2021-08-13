module.exports = (sequelize) => {
  const RolePermission = sequelize.define('RolePermission', {}, {
    tableName: 'role_permissions',
  });

  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Role, {
      foreignKey: 'role_id',
      onDelete: 'CASCADE',
    });
    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'permission_id',
      onDelete: 'CASCADE',
    });
  };

  return RolePermission;
};
