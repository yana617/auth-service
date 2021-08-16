const { ERRORS } = require('../translations');
const uafRepository = require('../repositories/UserAdditionalFieldRepository');

const getMyUaf = async (req, res) => {
  try {
    const { id } = req.user;
    const uaf = await uafRepository.getByUserId(id);
    res.json({ success: true, data: uaf });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const updateMyUaf = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: uafId } = req.params;

    const uaf = await uafRepository.getByIdAndUserId(uafId, userId);
    if (!uaf) {
      return res.status(404).json({ success: false, error: ERRORS.UAF_NOT_FOUND });
    }

    const { value } = req.body;
    if (typeof value !== 'boolean') {
      return res.status(400).json({ success: false, error: ERRORS.VALUE_BOOLEAN });
    }

    const updateInfo = await uafRepository.updateById(uafId, { value });
    res.json({ success: true, data: updateInfo[1] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  getMyUaf,
  updateMyUaf,
};
