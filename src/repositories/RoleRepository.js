const { Role } = require('../database');
const BaseRepository = require('./BaseRepository');

class RoleRepository extends BaseRepository {
  getByName(name, withRolePermissions = false) {
    const query = withRolePermissions ? { include: ['role_permissions'] } : {};
    return this.model.findOne({ where: { name }, ...query });
  }

  getAllWithPermissions() {
    return this.model.findAll({ include: ['role_permissions'], nest: true });
  }

  getByNames(names) {
    return this.model.findAll({ where: { name: names } });
  }
}

module.exports = new RoleRepository(Role);
