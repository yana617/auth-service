const errors = require('./errors');

const { LANG } = process.env;

const existingLangs = {
  EN: 'EN',
  RU: 'RU',
};

const lang = existingLangs[LANG] || 'EN';

module.exports = {
  ERRORS: errors[lang],
};
