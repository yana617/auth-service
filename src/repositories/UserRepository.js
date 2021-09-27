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

  async getByIdWithoutSaltHash(id, loadRole = false) {
    const query = loadRole ? { include: ['role'], nest: true } : {};
    return this.model.findByPk(id, { attributes: { exclude: ['hash', 'salt'] }, ...query, raw: true });
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

  async getShortUsersByIds(ids) {
    return this.model.findAll({
      where: { id: ids },
      attributes: { exclude: ['phone', 'email', 'birthday', 'hash', 'salt', 'role_id'] },
      raw: true,
    });
  }

  async getFullUsersByIds(ids) {
    return this.model.findAll({
      where: { id: ids },
      attributes: { exclude: ['hash', 'salt', 'role_id'] },
      raw: true,
    });
  }
}

module.exports = new UserRepository(User);
