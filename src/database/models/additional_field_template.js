module.exports = (sequelize, DataTypes) => {
  const AdditionalFieldTemplate = sequelize.define('AdditionalFieldTemplate', {
    label: DataTypes.STRING,
    icon: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    tableName: 'additional_field_templates',
  });

  return AdditionalFieldTemplate;
};
