const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { ERRORS } = require('../translations');
const userRepository = require('../repositories/UserRepository');

const registerUser = async (req, res) => {
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

    const user = await userRepository.getByEmailOrPhone(email, phone);
    if (user.length > 0) {
      return res.status(400).json({ success: false, error: ERRORS.USER_ALREADY_EXISTS });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await userRepository.create({
      name,
      surname,
      phone,
      email,
      salt,
      hash,
    });

    const result = newUser.get({ plain: true });
    delete result.hash;
    delete result.salt;

    res.status(201).json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: ERRORS.EMAIL_PASSWORD_REQUIRED });
  }
  try {
    const user = await userRepository.getByEmail(email);
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
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};