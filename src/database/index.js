import { Sequelize, DataTypes } from 'sequelize';

import configs from '#config';
import AdditionalFieldTemplate from './models/additional_field_template';
import User from './models/user';
import Role from './models/role';
import Token from './models/token';
import RolePermission from './models/role_permission';
import UserAdditionalField from './models/user_additional_field';
import Permission from './models/permission';
import UserPermission from './models/user_permission';
import Guest from './models/guest';

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    { ...config, logging: false },
  );
}

db.AdditionalFieldTemplate = AdditionalFieldTemplate(sequelize, DataTypes);
db.UserAdditionalField = UserAdditionalField(sequelize, DataTypes);
db.User = User(sequelize, DataTypes);
db.Role = Role(sequelize, DataTypes);
db.Token = Token(sequelize, DataTypes);
db.Permission = Permission(sequelize, DataTypes);
db.RolePermission = RolePermission(sequelize, DataTypes);
db.UserPermission = UserPermission(sequelize, DataTypes);
db.Guest = Guest(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
