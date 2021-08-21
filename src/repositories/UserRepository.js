const { Op, Sequelize } = require('sequelize');

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

  async getAllWithFilters({
    skip,
    limit,
    order,
    sortBy,
    search,
  }) {
    return this.model.findAll({
      where: Sequelize.where(Sequelize.fn('concat', Sequelize.col('name'), ' ', Sequelize.col('surname')), {
        [Op.iLike]: `%${search}%`,
      }),
      order: [
        [sortBy, order],
      ],
      offset: skip,
      limit,
      attributes: { exclude: ['hash', 'salt'] },
      raw: true,
    });
  }
}

module.exports = new UserRepository(User);
