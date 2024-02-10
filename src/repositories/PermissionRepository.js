import db from '#database';
import BaseRepository from './BaseRepository';

class PermissionRepository extends BaseRepository {
  getByNames(names) {
    return this.model.findAll({ where: { name: names }, raw: true });
  }
}

export default new PermissionRepository(db.Permission);
