const { Guest } = require('../database');
const BaseRepository = require('./BaseRepository');

class GuestRepository extends BaseRepository {
  async getByPhone(phone) {
    return this.model.findOne({
      where: { phone },
      raw: true,
    });
  }

  async getShortGuestsByIds(ids) {
    return this.model.findAll({
      where: { id: ids },
      attributes: { exclude: ['phone'] },
      raw: true,
    });
  }

  async getFullGuestsByIds(ids) {
    return this.model.findAll({
      where: { id: ids },
      raw: true,
    });
  }
}

module.exports = new GuestRepository(Guest);
