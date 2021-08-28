const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const { ERRORS } = require('../translations');
const userRepository = require('../repositories/UserRepository');
const tokenRepository = require('../repositories/TokenRepository');
const roleRepository = require('../repositories/RoleRepository');
const { DEFAULT_ROLE } = require('../database/constants');
const uafRepository = require('../repositories/UserAdditionalFieldRepository');
const aftRepository = require('../repositories/AdditionalFieldTemplateRepository');
const generateToken = require('../utils/generateToken');
const { sendLinkEmail, sendPasswordChangedSuccessfullyEmail } = require('../utils/mails');

const { CLIENT_URL: clientURL, BCRYPT_SALT: bcryptSalt } = process.env;

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
      additionalFields,
    } = req.body;

    const user = await userRepository.getByEmailOrPhone(email, phone);
    if (user.length > 0) {
      return res.status(400).json({ success: false, error: ERRORS.USER_ALREADY_EXISTS });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const role = await roleRepository.getByName(DEFAULT_ROLE);
    if (!role) {
      return res.status(500).json({ success: false, error: 'Default role not found' });
    }

    const newUser = await userRepository.create({
      name,
      surname,
      phone,
      email,
      salt,
      hash,
      role_id: role.id,
    });

    const allAft = await aftRepository.getAll();
    const userAftIds = additionalFields.map((uaf) => uaf.additionalFieldTemplateId);

    if (additionalFields.length !== allAft.length
      || !allAft.every(({ id }) => userAftIds.includes(id))) {
      return res.status(400).json({ success: false, error: ERRORS.AFT_FILL_REQUIRED });
    }

    await Promise.all(additionalFields.map((af) => uafRepository.create({
      user_id: newUser.id,
      additional_field_template_id: af.additionalFieldTemplateId,
      value: af.value,
    })));

    const result = newUser.get({ plain: true });
    result.token = generateToken(result);
    delete result.hash;
    delete result.salt;

    res.status(201).json({ success: true, data: result });
  } catch (e) {
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

    user.token = generateToken(user);
    delete user.hash;
    delete user.salt;
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await userRepository.getByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: ERRORS.USER_EMAIL_NOT_FOUND });
    }

    const existingToken = await tokenRepository.getByUserId(user.id);
    if (existingToken) {
      await tokenRepository.deleteById(existingToken.id);
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
    await tokenRepository.create({ user_id: user.id, token: hash });

    const link = `${clientURL}/reset-password?token=${resetToken}&userId=${user.id}`;
    await sendLinkEmail(link, email);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, token, password } = req.body;
    await tokenRepository.deleteExpiredTokens();
    const passwordResetToken = await tokenRepository.getByUserId(userId);
    if (!passwordResetToken) {
      return res.status(400).json({ success: false, error: ERRORS.INVALID_RESET_TOKEN });
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return res.status(400).json({ success: false, error: ERRORS.INVALID_RESET_TOKEN });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userUpdateInfo = await userRepository.updateById(userId, { salt, hash });
    await tokenRepository.deleteById(passwordResetToken.id);

    const user = userUpdateInfo[1];
    await sendPasswordChangedSuccessfullyEmail(user.email);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
