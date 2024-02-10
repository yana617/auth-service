import { ERRORS } from '#translations';

export const name = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.NAME_FIELD_ERROR,
    options: { min: 2, max: 30 },
  },
  exists: true,
};

export const surname = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.SURNAME_FIELD_ERROR,
    options: { min: 2, max: 30 },
  },
  exists: true,
};

export const phone = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.PHONE_FIELD_ERROR,
    options: { min: 12, max: 12 },
  },
  exists: true,
};

export const email = {
  in: ['body'],
  isEmail: {
    bail: true,
  },
  exists: true,
  errorMessage: ERRORS.EMAIL_FIELD_ERROR,
};

export const password = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.PASSWORD_FIELD_ERROR,
    options: { min: 6 },
  },
  exists: true,
};

export const birthday = {
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

export const userId = {
  in: ['body'],
  isLength: {
    errorMessage: ERRORS.INVALID_USER_ID,
    options: { min: 36, max: 36 },
  },
  exists: true,
};
