const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  label: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Label should be from 2 to 30 characters',
      options: { min: 2, max: 30 },
    },
    exists: true,
  },
  description: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Description should be from 50 to 150 characters',
      options: { min: 50, max: 150 },
    },
    exists: true,
  },
  icon: {
    in: ['body'],
    isLength: {
      errorMessage: 'Icon should be from 10 to 150 characters',
      options: { min: 10, max: 150 },
    },
    optional: { options: { nullable: true } },
  },
});
