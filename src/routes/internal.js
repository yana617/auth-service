const route = require('express').Router();
const jwt = require('jsonwebtoken');

const verifyToken = require('../middlewares/authRequired');
const userRepository = require('../repositories/UserRepository');
// const permissionController = require('../controllers/permission.controller');

const { TOKEN_KEY } = process.env;

route.get('/auth', verifyToken, (req, res) => res.json({ success: true }));
route.post('/users', async (req, res) => {
  try {
    const { ids = [] } = req.body;

    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      const users = await userRepository.getShortUsersByIds(ids);
      return res.json({ success: true, data: users });
    }
    try {
      req.user = jwt.verify(token, TOKEN_KEY);
    } catch (err) {
      const users = await userRepository.getShortUsersByIds(ids);
      return res.json({ success: true, data: users });
    }

    const users = await userRepository.getFullUsersByIds(ids);
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
