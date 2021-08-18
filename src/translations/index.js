const errors = require('./errors');
const texts = require('./texts');

const { LANG } = process.env;

const existingLangs = {
  EN: 'EN',
  RU: 'RU',
};

const lang = existingLangs[LANG] || 'EN';

module.exports = {
  ERRORS: errors[lang],
  TEXTS: texts[lang],
};
