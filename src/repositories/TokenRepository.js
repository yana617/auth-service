import { Op, Sequelize } from 'sequelize';

import db from '#database';
import BaseRepository from './BaseRepository';

class TokenRepository extends BaseRepository {
  async getByUserId(userId) {
    return this.model.findOne({ where: { user_id: userId } });
  }

  async deleteExpiredTokens() {
    return this.model.destroy({
      where: {
        expiration: { [Op.lt]: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
    });
  }
}

export default new TokenRepository(db.Token);
