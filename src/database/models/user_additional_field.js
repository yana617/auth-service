export default (sequelize, DataTypes) => {
  const UserAdditionalField = sequelize.define('UserAdditionalField', {
    value: DataTypes.BOOLEAN,
  }, {
    tableName: 'user_additional_fields',
  });

  UserAdditionalField.associate = (models) => {
    UserAdditionalField.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
    UserAdditionalField.belongsTo(models.AdditionalFieldTemplate, {
      foreignKey: 'additional_field_template_id',
      onDelete: 'CASCADE',
    });
  };

  return UserAdditionalField;
};
