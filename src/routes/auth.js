const bcrypt = require('bcrypt');
const route = require('express').Router();
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const models = require('../database');
const validateUser = require('../middlewares/validateUser');
const { ERRORS } = require('../translations');
const { DEFAULT_ROLE } = require('../database/constants');

route.post('/register', validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      surname,
      phone,
      email,
      password,
    } = req.body;

    const user = await models.User.findAll({
      where: {
        [Op.or]: [
          { phone },
          { email },
        ],
      },
    });
    if (user.length > 0) {
      return res.status(400).json({ success: false, error: ERRORS.USER_ALREADY_EXISTS });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const role = await models.Role.findOne({ where: { name: DEFAULT_ROLE } });
    if (!role) {
      return res.status(500).json({ success: false, error: 'Default role not found' });
    }

    const newUser = models.User.build({
      name,
      surname,
      phone,
      email,
      salt,
      hash,
      role_id: role.id,
    });
    await newUser.save();

    const result = newUser.get({ plain: true });
    delete result.hash;
    delete result.salt;

    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

route.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: ERRORS.EMAIL_PASSWORD_REQUIRED });
  }
  try {
    const user = await models.User.findOne({ where: { email }, raw: true });
    if (!user) {
      return res.status(400).json({ success: false, error: ERRORS.USER_EMAIL_NOT_FOUND });
    }
    if (user.hash !== bcrypt.hashSync(password, user.salt)) {
      return res.status(400).json({ success: false, error: ERRORS.AUTH_ERROR });
    }
    const token = jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2d',
      },
    );
    user.token = token;
    delete user.hash;
    delete user.salt;
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = route;
