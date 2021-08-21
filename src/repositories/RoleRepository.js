const { Role } = require('../database');
const BaseRepository = require('./BaseRepository');

class RoleRepository extends BaseRepository {
  getByName(name, withRolePermissions = false) {
    const query = withRolePermissions ? { include: ['role_permissions'] } : {};
    return this.model.findOne({ where: { name }, ...query });
  }
}

module.exports = new RoleRepository(Role);
