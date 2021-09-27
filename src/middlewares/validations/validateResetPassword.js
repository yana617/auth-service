const { checkSchema } = require('express-validator');

const { ERRORS } = require('../../translations');
const { password } = require('../../utils/validationOptions');

module.exports = checkSchema({
  token: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.INVALID_TOKEN,
      options: { min: 10, max: 200 },
    },
    exists: true,
  },
  userId: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.INVALID_USER_ID,
      options: { min: 36, max: 36 },
    },
    exists: true,
  },
  password,
});
