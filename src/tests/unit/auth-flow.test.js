const request = require('supertest');

const app = require('../../../app');
const db = require('../../database');
const { generateUser } = require('../fixtures/db');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

test('I can register, login and get own info successfully', async () => {
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

  const loginResponse = await request(app)
    .post('/auth/login')
    .send(userToSave)
    .expect(200);

  const { data: loginUser } = loginResponse.body;

  expect(loginUser.name).toEqual(userToSave.name);
  expect(loginUser.token).not.toBeNull();

  const response = await request(app)
    .get('/users/me')
    .set('x-access-token', loginUser.token)
    .expect(200);

  const { data: user } = response.body;
  expect(user).toBeDefined();
  expect(user.name).toEqual(userToSave.name);
});
