const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUserAndGetToken } = require('./fixtures/db');
const { ERRORS } = require('../translations');
const { roles } = require('../database/constants');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /roles', () => {
  test('Should return all roles', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get('/roles')
      .set('x-access-token', token)
      .expect(200);

    const { data: rolesResponse } = response.body;
    expect(rolesResponse).not.toBeNull();
    expect(rolesResponse.length).toEqual(roles.length);
  });

  test('Should fail because you do not have enough permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/roles')
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });
});
