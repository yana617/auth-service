const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { ERRORS, TEXTS } = require('../translations');
const userRepository = require('../repositories/UserRepository');
const tokenRepository = require('../repositories/TokenRepository');

const {
  CLIENT_URL: clientURL,
  BCRYPT_SALT: bcryptSalt,
  EMAIL_LOGIN,
  EMAIL_PASSWORD,
  TRANSPORT_HOST,
  TRANSPORT_PORT,
} = process.env;

const transporter = nodemailer.createTransport({
  port: TRANSPORT_PORT,
  host: TRANSPORT_HOST,
  auth: {
    user: EMAIL_LOGIN,
    pass: EMAIL_PASSWORD,
  },
  secure: true,
});

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

    const link = `${clientURL}/reset-password?token=${resetToken}&id=${user.id}`;

    await transporter.sendMail({
      from: EMAIL_LOGIN,
      to: email,
      subject: TEXTS.EMAIL_SUBJECT_LINK,
      html: `<b>${TEXTS.HELLO}</b>
        <br>${TEXTS.RESET_LINK}:<br/>
        <a href='${link}'>${TEXTS.OPEN_LINK}</a>`,
    });

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
    await transporter.sendMail({
      from: EMAIL_LOGIN,
      to: user.email,
      subject: TEXTS.EMAIL_SUBJECT_SUCCESS,
      text: TEXTS.EMAIL_SUCCESS_DESCRIPTION,
    });

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
