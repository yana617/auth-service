module.exports = (sequelize, DataTypes) => {
  const UserAdditionalField = sequelize.define('UserAdditionalField', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false,
    },
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
