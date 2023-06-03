import request from 'supertest';
import nock from 'nock';

import db from '#database';
import { createUserAndGetToken, generateUser } from '../fixtures/db';
import app from '../../../app';

const { EVENTS_SERVICE_URL } = process.env;

jest.mock('utils/emitHistoryAction');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
  await db.Token.destroy({ where: {} });
  nock(EVENTS_SERVICE_URL).post('/history-actions').reply(200, { success: true });
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

const findTokenInLink = (link) => {
  const start = link.indexOf('token');
  const end = link.indexOf('userId');
  return link.slice(start + 6, end - 1);
};

test('I forgot password and can reset it successfully', async () => {
  const adminToken = await createUserAndGetToken(generateUser(), 'ADMIN');

  const userOne = generateUser();
  const registerResponse = await request(app)
    .post('/auth/register')
    .send(userOne)
    .expect(201);

  const { data: newUser } = registerResponse.body;
  expect(newUser.name).toEqual(userOne.name);
  const userInDb = await db.User.findOne({ where: { phone: userOne.phone } });
  expect(userInDb).toBeDefined();
  expect(userInDb.name).toEqual(userOne.name);

  const updatedPassword = '111111';

  // admin asks for link and share it to user
  const forgotResponse = await request(app)
    .post('/auth/forgot-password')
    .send({ userId: userInDb.id })
    .set('x-access-token', adminToken)
    .expect(200);

  const { success, data: resetLink } = forgotResponse.body;
  expect(success).toBeTruthy();
  expect(resetLink).toBeDefined();

  await request(app)
    .post('/auth/login')
    .send({
      email: userInDb.email,
      password: updatedPassword,
    })
    .expect(400);

  const resetResponse = await request(app)
    .post('/auth/reset-password')
    .send({
      token: findTokenInLink(resetLink),
      userId: userInDb.id,
      password: updatedPassword,
    })
    .expect(200);

  const { success: resetSuccess } = resetResponse.body;
  expect(resetSuccess).toBeTruthy();

  const loginResponse = await request(app)
    .post('/auth/login')
    .send({ email: userInDb.email, password: updatedPassword })
    .expect(200);

  const { data: loginUser } = loginResponse.body;

  expect(loginUser.name).toEqual(userInDb.name);
  expect(loginUser.token).not.toBeNull();
});
