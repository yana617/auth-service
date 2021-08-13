const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser, createUserAndGetToken } = require('./fixtures/db');
const { ERRORS } = require('../translations');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /user/:id', () => {
  test('Should return user', async () => {
    const userToSave = generateUser();
    const token = await createUserAndGetToken(userToSave, 'VOLUNTEER');

    const response = await request(app)
      .get(`/users/${userToSave.id}`)
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).not.toBeNull();
    expect(user.name).toEqual(userToSave.name);
  });

  test('Should fail because you request not yours information', async () => {
    const userOne = generateUser();
    const userTwo = generateUser();
    await createUser(userOne);
    const token = await createUserAndGetToken(userTwo);

    const response = await request(app)
      .get(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });
});
