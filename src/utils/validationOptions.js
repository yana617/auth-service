const { ERRORS } = require('../translations');

exports.name = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.NAME_FIELD_ERROR,
    options: { min: 2, max: 30 },
  },
  exists: true,
};

exports.surname = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.SURNAME_FIELD_ERROR,
    options: { min: 2, max: 30 },
  },
  exists: true,
};

exports.phone = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.PHONE_FIELD_ERROR,
    options: { min: 12, max: 12 },
  },
  exists: true,
};

exports.email = {
  in: ['body'],
  isEmail: {
    bail: true,
  },
  exists: true,
  errorMessage: ERRORS.EMAIL_FIELD_ERROR,
};

exports.password = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.PASSWORD_FIELD_ERROR,
    options: { min: 6 },
  },
  exists: true,
};
