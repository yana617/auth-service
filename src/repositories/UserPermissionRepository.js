import db from '#database';
import BaseRepository from './BaseRepository';

class UserPermissionRepository extends BaseRepository {
  getByUserId(userId) {
    return this.model.findAll({ where: { user_id: userId }, include: ['permission'], nest: true });
  }

  deleteByUserIdAndPermissionId(userId, permissionsIds) {
    return this.model.destroy({ where: { user_id: userId, permission_id: permissionsIds } });
  }
}

export default new UserPermissionRepository(db.UserPermission);
