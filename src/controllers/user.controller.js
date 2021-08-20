const userRepository = require('../repositories/UserRepository');

const getMe = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await userRepository.getByIdWithoutSaltHash(id);
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getMe,
};
