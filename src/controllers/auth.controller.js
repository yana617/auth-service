import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { ERRORS } from '#translations';
import userRepository from '#repositories/UserRepository';
import tokenRepository from '#repositories/TokenRepository';
import roleRepository from '#repositories/RoleRepository';
import { DEFAULT_ROLE } from '#database/constants';
import uafRepository from '#repositories/UserAdditionalFieldRepository';
import aftRepository from '#repositories/AdditionalFieldTemplateRepository';
import generateToken from '#utils/generateToken';
import { emitHistoryAction } from '#utils/emitHistoryAction';
import { HISTORY_ACTION_TYPES } from '#constants';

const { CLIENT_URL: clientURL, BCRYPT_SALT: bcryptSalt } = process.env;

const registerUser = async (req, res) => {
  const {
    name,
    surname,
    phone,
    email,
    password,
    additionalFields,
    birthday,
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

  const allAft = await aftRepository.getAll();
  const userAftIds = additionalFields.map((uaf) => uaf.additionalFieldTemplateId);

  if (additionalFields.length !== allAft.length
    || !allAft.every(({ id }) => userAftIds.includes(id))) {
    return res.status(400).json({ success: false, error: ERRORS.AFT_FILL_REQUIRED });
  }

  const newUser = await userRepository.create({
    name,
    surname,
    phone,
    birthday,
    email,
    salt,
    hash,
    role_id: role.id,
  });

  await Promise.all(additionalFields.map((af) => uafRepository.create({
    user_id: newUser.id,
    additional_field_template_id: af.additionalFieldTemplateId,
    value: af.value,
  })));

  const result = newUser.get({ plain: true });
  result.token = generateToken(result);
  delete result.hash;
  delete result.salt;

  emitHistoryAction({ action_type: HISTORY_ACTION_TYPES.NEW_USER, user_from_id: result.id });

  res.status(201).json({ success: true, data: result });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: ERRORS.EMAIL_PASSWORD_REQUIRED });
  }
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
};

const generateResetLink = async (req, res) => {
  const { userId } = req.body;

  const user = await userRepository.getById(userId);
  if (!user) {
    return res.status(400).json({ success: false, error: ERRORS.USER_NOT_FOUND });
  }

  const existingToken = await tokenRepository.getByUserId(user.id);
  if (existingToken) {
    await tokenRepository.deleteById(existingToken.id);
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  await tokenRepository.create({
    user_id: user.id,
    token: hash,
    expiration: new Date(Date.now() + 1000 * 60 * 20),
  });

  const resetLink = `${clientURL}/reset-password?token=${resetToken}&userId=${user.id}`;

  res.json({ success: true, data: resetLink });
};

const resetPassword = async (req, res) => {
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

  await userRepository.updateById(userId, { salt, hash });
  await tokenRepository.deleteById(passwordResetToken.id);

  res.json({ success: true });
};

export default {
  registerUser,
  loginUser,
  resetPassword,
  generateResetLink,
};
