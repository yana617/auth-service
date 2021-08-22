const { permissions } = require('../../database/constants');
const { PERMISSIONS } = require('../../translations');

test('Expect all permissions translates exist', async () => {
  const translatesCount = Object.keys(PERMISSIONS);
  expect(translatesCount.length).toBe(permissions.length);
});
