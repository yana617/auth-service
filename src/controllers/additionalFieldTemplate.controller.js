import { ERRORS } from '#translations';
import aftRepository from '#repositories/AdditionalFieldTemplateRepository';
import userRepository from '#repositories/UserRepository';
import uafRepository from '#repositories/UserAdditionalFieldRepository';

const getAllAft = async (req, res) => {
  const aft = await aftRepository.getAll();
  res.json({ success: true, data: aft });
};

const createAft = async (req, res) => {
  const { label, description, icon } = req.body;
  const newAft = await aftRepository.create({ label, description, icon });

  const users = await userRepository.getAll();
  await Promise.all(users.map(async (user) => uafRepository.create({
    additional_field_template_id: newAft.id,
    user_id: user.id,
    value: false,
  })));

  res.status(201).json({ success: true, data: newAft });
};

const updateAft = async (req, res) => {
  const { id } = req.params;
  const aft = await aftRepository.getById(id);
  if (!aft) {
    return res.status(404).json({ success: false, error: ERRORS.AFT_NOT_FOUND });
  }

  const { label, description, icon = '' } = req.body;
  const updatedInfo = await aftRepository.updateById(id, { label, description, icon });
  res.json({ success: true, data: updatedInfo[1] });
};

const deleteAft = async (req, res) => {
  const { id } = req.params;
  await aftRepository.deleteById(id);
  res.json({ success: true });
};

export default {
  getAllAft,
  createAft,
  updateAft,
  deleteAft,
};
