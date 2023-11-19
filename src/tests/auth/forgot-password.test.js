import request from 'supertest';
import { v4 } from 'uuid';

import db from '#database';
import { ERRORS } from '#translations';
import { createUser, createUserAndGetToken, generateUser } from '../fixtures/db';
import app from '../../../app';

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('POST /forgot-password', () => {
  test('Should successfully send link to admin', async () => {
    const adminToken = await createUserAndGetToken(generateUser(), 'ADMIN');
    const user = await createUser();

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        userId: user.id,
      })
      .set('x-access-token', adminToken)
      .expect(200);

    const { data: resetLink } = response.body;

    const userTokenInDb = await db.Token.findOne({ where: { user_id: user.id } });
    expect(userTokenInDb).toBeDefined();

    expect(resetLink?.includes(user.id)).toBe(true);
  });

  test('Should fail without permissions', async () => {
    const userToken = await createUserAndGetToken();
    const user = await createUser();

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        userId: user.id,
      })
      .set('x-access-token', userToken)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);

    const userTokenInDb = await db.Token.findOne({ where: { user_id: user.id } });
    expect(userTokenInDb).toBeNull();
  });

  test('Should fail without userId', async () => {
    const adminToken = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .post('/auth/forgot-password')
      .set('x-access-token', adminToken)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with incorrect userId', async () => {
    const adminToken = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        userId: v4(),
      })
      .set('x-access-token', adminToken)
      .expect(404);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_NOT_FOUND);

    const response2 = await request(app)
      .post('/auth/forgot-password')
      .send({
        userId: 'incorrect',
      })
      .set('x-access-token', adminToken)
      .expect(400);

    const { errors } = response2.body;
    expect(errors).toBeDefined();
  });
});
