const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const models = require('../database');
const { ERRORS } = require('../translations');

// TO-DO-v2 users access
route.get('/:id', verifyToken, async (req, res) => {
  const { id: user_id } = req.user;
  const { id } = req.params;
  if (user_id !== id) {
    return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
  }
  try {
    const user = await models.User.findByPk(id, { attributes: { exclude: ['hash', 'salt'] }, raw: true });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
