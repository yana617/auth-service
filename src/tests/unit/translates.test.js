import { permissions } from '#database/constants';
import { PERMISSIONS } from '#translations';
import errors from '#translations/errors';

test('Expect all permissions translates exist', async () => {
  const translatesCount = Object.keys(PERMISSIONS);
  expect(translatesCount.length).toBe(permissions.length);
});

test('Expect all errors translates exist for all languages', async () => {
  const languages = Object.keys(errors);
  const enTranslatesCount = Object.keys(errors.EN);
  languages.forEach((lang) => {
    const langKeys = Object.keys(errors[lang]);
    expect(enTranslatesCount.length).toBe(langKeys.length);
  });
});
