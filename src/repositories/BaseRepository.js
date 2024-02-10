class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  getAll() {
    return this.model.findAll();
  }

  getById(id) {
    return this.model.findByPk(id);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data) {
    return this.model.update(data, {
      where: { id },
      returning: true,
      plain: true,
      raw: true,
    });
  }

  deleteById(id) {
    return this.model.destroy({
      where: { id },
    });
  }
}

export default BaseRepository;
