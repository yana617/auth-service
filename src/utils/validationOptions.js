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

exports.birthday = {
  in: ['body'],
  errorMessage: ERRORS.INVALID_BIRTHDAY,
  custom: {
    options: (value) => {
      const enteredDate = new Date(value);
      const todaysDate = new Date();
      if (enteredDate > todaysDate) {
        throw new Error(ERRORS.INVALID_BIRTHDAY);
      }
      return !Number.isNaN(Date.parse(value));
    },
  },
  exists: true,
};
