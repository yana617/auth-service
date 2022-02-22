const { Op, Sequelize } = require('sequelize');

const { User } = require('../database');
const BaseRepository = require('./BaseRepository');

const searchByNameAndRoles = (search, roles) => ({
  [Op.and]: [
    Sequelize.where(Sequelize.fn('concat', Sequelize.col('name'), ' ', Sequelize.col('surname')), {
      [Op.iLike]: `%${search}%`,
    }),
    (roles ? { role_id: roles } : {}),
  ],
});

const emailCaseInsensitiveQuery = (email) => Sequelize
  .where(Sequelize.fn('LOWER', Sequelize.col('email')), 'LIKE', `%${email.toLowerCase()}%`);

class UserRepository extends BaseRepository {
  async getByEmailOrPhone(email, phone) {
    return this.model.findAll({
      where: {
        [Op.or]: [
          { phone },
          { email: emailCaseInsensitiveQuery(email) },
        ],
      },
    });
  }

  async getByEmail(email) {
    return this.model.findOne({
      where: { email: emailCaseInsensitiveQuery(email) },
      raw: true,
    });
  }

  async getByIdWithoutSaltHash(id, loadRole = false) {
    const query = loadRole ? { include: ['role'], nest: true } : {};
    return this.model.findByPk(id, { attributes: { exclude: ['hash', 'salt'] }, ...query, raw: true });
  }

  async getAllFiltered({
    skip,
    limit,
    order,
    sortBy,
    search,
    roles,
  }) {
    return this.model.findAll({
      where: searchByNameAndRoles(search, roles),
      order: [
        [sortBy, order],
      ],
      offset: skip,
      limit,
      attributes: { exclude: ['hash', 'salt'] },
      include: ['user_additional_fields'],
      nest: true,
    });
  }

  async getCountFiltered({ search, roles }) {
    return this.model.count({ where: searchByNameAndRoles(search, roles) });
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
      include: ['user_additional_fields'],
      nest: true,
    });
  }
}

module.exports = new UserRepository(User);
