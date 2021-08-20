const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { userOne, createUserAndGetToken } = require('./fixtures/db');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /user/:id', () => {
  test('Should return user', async () => {
    const token = await createUserAndGetToken(userOne);

    const response = await request(app)
      .get('/users/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).not.toBeNull();
    expect(user.name).toEqual(userOne.name);
  });
});
