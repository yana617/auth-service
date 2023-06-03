export default (sequelize, DataTypes) => {
  const Guest = sequelize.define('Guest', {
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, {
    tableName: 'guests',
  });

  return Guest;
};
