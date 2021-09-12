const { checkSchema } = require('express-validator');

const validationOptions = require('../utils/validationOptions');
const { ERRORS } = require('../translations');

module.exports = checkSchema({
  name: validationOptions.name,
  surname: validationOptions.surname,
  phone: validationOptions.phone,
  email: validationOptions.email,
  birthday: validationOptions.birthday,
  password: validationOptions.password,
  additionalFields: {
    exists: true,
    isArray: true,
    errorMessage: ERRORS.UAF_FIELD_ERROR,
  },
  'additionalFields.*.additionalFieldTemplateId': {
    exists: true,
  },
  'additionalFields.*.value': {
    exists: true,
    isBoolean: true,
  },
});
