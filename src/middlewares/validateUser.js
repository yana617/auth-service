const { checkSchema } = require('express-validator');

const { password } = require('../utils/validationOptions');

module.exports = checkSchema({
  name: {
    in: ['body'],
    isLength: {
      errorMessage: 'Name should be from 2 to 30 characters',
      options: { min: 2, max: 30 },
    },
    exists: true,
  },
  surname: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Surname should be from 2 to 30 characters',
      options: { min: 2, max: 30 },
    },
    exists: true,
  },
  phone: {
    in: ['body'],
    isLength: {
      errorMessage: 'Phone should be 12 characters',
      options: { min: 12, max: 12 },
    },
    exists: true,
  },
  email: {
    in: ['body'],
    isEmail: {
      bail: true,
    },
    exists: true,
  },
  password,
  additional_fields: {
    exists: true,
    isArray: true,
  },
  'additional_fields.*.additional_field_template_id': {
    exists: true,
  },
  'additional_fields.*.value': {
    exists: true,
    isBoolean: true,
  },
});
