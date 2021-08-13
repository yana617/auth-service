const route = require('express').Router();

const verifyToken = require('../middlewares/auth');
const models = require('../database');
const checkPermissions = require('../middlewares/checkPermissions');

route.get('/', verifyToken, checkPermissions(['EDIT_PERMISSIONS']), async (req, res) => {
  try {
    const roles = await models.Role.findAll();
    res.json({ success: true, data: roles.map((r) => r.name) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
