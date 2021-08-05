module.exports = (sequelize, DataTypes) => {
  const AdditionalFieldTemplate = sequelize.define('AdditionalFieldTemplate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false,
    },
    label: DataTypes.STRING,
    icon: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    tableName: 'additional_field_templates',
  });

  return AdditionalFieldTemplate;
};
