const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const {
  userOne,
  userTwo,
  createUser,
  createUserAndGetToken,
} = require('./fixtures/db');
const { ERRORS } = require('../translations');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /user/:id', () => {
  test('Should return user', async () => {
    const token = await createUserAndGetToken(userOne);

    const response = await request(app)
      .get(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).not.toBeNull();
    expect(user.name).toEqual(userOne.name);
  });

  test('Should fail because you request not yours information', async () => {
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
