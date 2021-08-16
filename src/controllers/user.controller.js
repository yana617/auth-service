const { validationResult } = require('express-validator');

const userRepository = require('../repositories/UserRepository');
const { DEFAULT_LIMIT } = require('../database/constants');

const getMe = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await userRepository.getByIdWithoutSaltHash(id);
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const getUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      sortBy = 'name',
      order = 'ASC',
      limit = DEFAULT_LIMIT,
      skip = 0,
      search = '',
    } = req.query;
    const users = await userRepository.getAllWithFilters({
      sortBy,
      order,
      limit,
      skip,
      search,
    });
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getMe,
  getUsers,
};
