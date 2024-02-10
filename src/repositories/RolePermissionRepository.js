import db from '#database';
import BaseRepository from './BaseRepository';

class RolePermissionRepository extends BaseRepository {
  getByRoleId(roleId) {
    return this.model.findAll({ where: { role_id: roleId }, include: ['permission'] });
  }
}

export default new RolePermissionRepository(db.RolePermission);
