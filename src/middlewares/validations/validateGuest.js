const { checkSchema } = require('express-validator');

const validationOptions = require('../../utils/validationOptions');

module.exports = checkSchema({
  name: validationOptions.name,
  surname: validationOptions.surname,
  phone: validationOptions.phone,
});
