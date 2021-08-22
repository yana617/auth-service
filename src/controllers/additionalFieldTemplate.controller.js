const { validationResult } = require('express-validator');

const { ERRORS } = require('../translations');
const aftRepository = require('../repositories/AdditionalFieldTemplateRepository');
const userRepository = require('../repositories/UserRepository');
const uafRepository = require('../repositories/UserAdditionalFieldRepository');

const getAllAft = async (req, res) => {
  try {
    const aft = await aftRepository.getAll();
    res.json({ success: true, data: aft });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const createAft = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { label, description, icon = '' } = req.body;
    const newAft = await aftRepository.create({ label, description, icon });

    const users = await userRepository.getAll();
    await Promise.all(users.map(async (user) => uafRepository.create({
      additional_field_template_id: newAft.id,
      user_id: user.id,
      value: false,
    })));

    res.status(201).json({ success: true, data: newAft });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const updateAft = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const aft = await aftRepository.getById(id);
    if (!aft) {
      return res.status(404).json({ success: false, error: ERRORS.AFT_NOT_FOUND });
    }

    const { label, description, icon = '' } = req.body;
    const updatedInfo = await aftRepository.updateById(id, { label, description, icon });
    res.json({ success: true, data: updatedInfo[1] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const deleteAft = async (req, res) => {
  try {
    const { id } = req.params;
    await aftRepository.deleteById(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getAllAft,
  createAft,
  updateAft,
  deleteAft,
};
