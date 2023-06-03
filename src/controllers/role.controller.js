import roleRepository from '#repositories/RoleRepository';

const getAll = async (req, res) => {
  const roles = await roleRepository.getAll();
  res.json({
    success: true,
    data: roles.map((r) => ({ name: r.name, translate: r.translate })),
  });
};

export default {
  getAll,
};
