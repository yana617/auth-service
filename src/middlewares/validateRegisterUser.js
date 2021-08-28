const { checkSchema } = require('express-validator');

const validationOptions = require('../utils/validationOptions');

module.exports = checkSchema({
  name: validationOptions.name,
  surname: validationOptions.surname,
  phone: validationOptions.phone,
  email: validationOptions.email,
  password: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Password should be at least 6 chars long',
      options: { min: 6 },
    },
    exists: true,
  },
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
