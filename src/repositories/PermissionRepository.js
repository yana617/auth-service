const { Permission } = require('../database');
const BaseRepository = require('./BaseRepository');

class PermissionRepository extends BaseRepository {
  getByNames(names) {
    return this.model.findAll({ where: { name: names }, raw: true });
  }
}

module.exports = new PermissionRepository(Permission);
