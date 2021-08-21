const { Role } = require('../database');
const BaseRepository = require('./BaseRepository');

class RoleRepository extends BaseRepository {
  getByName(name) {
    return this.model.findOne({ where: { name } });
  }
}

module.exports = new RoleRepository(Role);
