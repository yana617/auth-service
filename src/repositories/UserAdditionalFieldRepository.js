import db from '#database';
import BaseRepository from './BaseRepository';

class UserAdditionalFieldRepository extends BaseRepository {
  async getByUserId(userId) {
    return this.model.findAll({ where: { user_id: userId } });
  }

  async getByIdAndUserId(uafId, userId) {
    return this.model.findOne({ where: { id: uafId, user_id: userId } });
  }
}

export default new UserAdditionalFieldRepository(db.UserAdditionalField);
