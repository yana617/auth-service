const request = require('supertest');
const nock = require('nock');

const app = require('../../../app');
const db = require('../../database');
const { generateUser, createUserAndGetToken } = require('../fixtures/db');
const { rolePermissions } = require('../../database/constants');

const { EVENTS_SERVICE_URL } = process.env;

jest.mock('../../utils/emitHistoryAction');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.UserPermission.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
  nock(EVENTS_SERVICE_URL).post('/history-actions').reply(200, { success: true });
});

test('I can register, update permissions and change role successfully', async () => {
  const token = await createUserAndGetToken(generateUser(), 'ADMIN');
  const userToSave = generateUser();
  const registerResponse = await request(app)
    .post('/auth/register')
    .send(userToSave)
    .expect(201);

  const { data: newUser } = registerResponse.body;
  expect(newUser.name).toEqual(userToSave.name);
  const userInDb = await db.User.findOne({ where: { phone: userToSave.phone } });
  expect(userInDb).toBeDefined();
  expect(userInDb.name).toEqual(userToSave.name);

  await request(app)
    .put('/permissions')
    .send({
      userId: newUser.id,
      permissions: {
        CREATE_CLAIM: true,
        EDIT_NOTICE: true,
      },
    })
    .set('x-access-token', token)
    .expect(200);

  const updatedPermissions = await request(app)
    .get(`/users/${newUser.id}/permissions`)
    .set('x-access-token', token)
    .expect(200);

  const { data: permissions } = updatedPermissions.body;
  expect(permissions).not.toBeNull();
  expect(permissions.rolePermissions).toEqual(rolePermissions.USER);
  expect(permissions.userPermissions.length).toBe(2);

  await request(app)
    .put(`/users/${newUser.id}/role`)
    .send({
      role: 'VOLUNTEER',
    })
    .set('x-access-token', token)
    .expect(200);

  const updatedRole = await request(app)
    .get(`/users/${newUser.id}/permissions`)
    .set('x-access-token', token)
    .expect(200);

  const { data: updatedPermsRole } = updatedRole.body;
  expect(updatedPermsRole).not.toBeNull();
  expect(updatedPermsRole.rolePermissions).toEqual(rolePermissions.VOLUNTEER);
  expect(updatedPermsRole.userPermissions.length).toBe(1);
});
