import errors from './errors';
import permissions from './permissions';

const { LANG } = process.env;

const existingLangs = {
  EN: 'EN',
  RU: 'RU',
};

const lang = existingLangs[LANG] || 'EN';

export const ERRORS = errors[lang];
export const PERMISSIONS = permissions[lang];
