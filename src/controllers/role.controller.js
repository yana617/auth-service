const roleRepository = require('../repositories/RoleRepository');

const getAll = async (req, res) => {
  try {
    const roles = await roleRepository.getAll();
    res.json({
      success: true,
      data: roles.map((r) => ({ name: r.name, translate: r.translate })),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getAll,
};
