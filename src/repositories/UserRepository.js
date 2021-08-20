const { Op } = require('sequelize');

const { User } = require('../database');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  async getByEmailOrPhone(email, phone) {
    return this.model.findAll({
      where: {
        [Op.or]: [
          { phone },
          { email },
        ],
      },
    });
  }

  async getByEmail(email) {
    return this.model.findOne({
      where: { email },
      raw: true,
    });
  }

  async getByIdWithoutSaltHash(id) {
    return this.model.findByPk(id, { attributes: { exclude: ['hash', 'salt'] }, raw: true });
  }
}

module.exports = new UserRepository(User);
