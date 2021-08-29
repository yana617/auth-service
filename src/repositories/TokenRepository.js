const { Op, Sequelize } = require('sequelize');

const { Token } = require('../database');
const BaseRepository = require('./BaseRepository');

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

module.exports = new TokenRepository(Token);
