const { UserAdditionalField } = require('../database');
const BaseRepository = require('./BaseRepository');

class UserAdditionalFieldRepository extends BaseRepository {
  async getByUserId(userId) {
    return this.model.findAll({ where: { user_id: userId } });
  }

  async getByIdAndUserId(uafId, userId) {
    return this.model.findOne({ where: { id: uafId, user_id: userId } });
  }
}

module.exports = new UserAdditionalFieldRepository(UserAdditionalField);
