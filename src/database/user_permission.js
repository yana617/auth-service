module.exports = (sequelize) => {
  const UserPermission = sequelize.define('UserPermission', {}, {
    tableName: 'user_permissions',
  });

  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
    UserPermission.belongsTo(models.Permission, {
      foreignKey: 'permission_id',
      onDelete: 'CASCADE',
    });
  };

  return UserPermission;
};
