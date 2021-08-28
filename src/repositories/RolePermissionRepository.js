const { RolePermission } = require('../database');
const BaseRepository = require('./BaseRepository');

class RolePermissionRepository extends BaseRepository {
  getByRoleId(roleId) {
    return this.model.findAll({ where: { role_id: roleId }, include: ['permission'] });
  }
}

module.exports = new RolePermissionRepository(RolePermission);
