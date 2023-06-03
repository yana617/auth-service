import request from 'supertest';

import { ERRORS } from '#translations';
import db from '#database';
import { generateUser, createUser } from '../fixtures/db';
import app from '../../../app';

jest.mock('utils/emitHistoryAction');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('POST /login', () => {
  test('Should login existing user', async () => {
    const userOne = generateUser();
    await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(201);

    const response = await request(app)
      .post('/auth/login')
      .send(userOne)
      .expect(200);

    const { data: user } = response.body;

    expect(user.name).toEqual(userOne.name);
    expect(user.token).not.toBeNull();
  });

  test('Should login existing user (email insensitive case test)', async () => {
    const userOne = generateUser();
    const userWithLowerCaseEmail = { ...userOne, email: 'test@example.com' };
    const userWithUpperCaseEmail = { ...userOne, email: 'Test@example.com' };

    await request(app)
      .post('/auth/register')
      .send(userWithLowerCaseEmail)
      .expect(201);

    await request(app)
      .post('/auth/login')
      .send(userWithLowerCaseEmail)
      .expect(200);

    const response = await request(app)
      .post('/auth/login')
      .send(userWithUpperCaseEmail)
      .expect(200);

    const { data: user } = response.body;

    expect(user.name).toEqual(userOne.name);
    expect(user.token).not.toBeNull();
  });

  test('Should fail because fields filled wrong', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({})
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.EMAIL_PASSWORD_REQUIRED);
  });

  test('Should fail because of user not found', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'not@exist.com',
        password: 'wrong',
      })
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_EMAIL_NOT_FOUND);
  });

  test('Should fail because of wrong credentials', async () => {
    const userOne = await createUser();
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: userOne.email,
        password: 'no',
      })
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.AUTH_ERROR);
  });
});
