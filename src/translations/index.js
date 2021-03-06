const errors = require('./errors');
const texts = require('./texts');
const permissions = require('./permissions');

const { LANG } = process.env;

const existingLangs = {
  EN: 'EN',
  RU: 'RU',
};

const lang = existingLangs[LANG] || 'EN';

module.exports = {
  ERRORS: errors[lang],
  TEXTS: texts[lang],
  PERMISSIONS: permissions[lang],
};
