const { checkSchema } = require('express-validator');

const { password } = require('../utils/validationOptions');

module.exports = checkSchema({
  token: {
    in: ['body'],
    isLength: {
      errorMessage: 'Token can be from 2 to 30 characters',
      options: { min: 10, max: 200 },
    },
    exists: true,
  },
  userId: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'userId should be 36 characters',
      options: { min: 36, max: 36 },
    },
    exists: true,
  },
  password,
});
