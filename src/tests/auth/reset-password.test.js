import request from 'supertest';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

import db from '#database';
import { ERRORS } from '#translations';
import { createUser } from '../fixtures/db';
import app from '../../../app';

const { BCRYPT_SALT: bcryptSalt } = process.env;

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('POST /reset-password', () => {
  test('Should successfully update password', async () => {
    const userOne = await createUser();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
    await db.Token.create({ user_id: userOne.id, token: hash });
    const newPassword = 'testTest';

    const token = await db.Token.findOne({ where: { user_id: userOne.id } });
    expect(token).toBeDefined();

    await request(app)
      .post('/auth/login')
      .send({
        email: userOne.email,
        password: newPassword,
      })
      .expect(400);

    await request(app)
      .post('/auth/reset-password')
      .send({
        token: resetToken,
        userId: userOne.id,
        password: newPassword,
      })
      .expect(200);

    await request(app)
      .post('/auth/login')
      .send({
        email: userOne.email,
        password: newPassword,
      })
      .expect(200);

    const tokenAfterUpdate = await db.Token.findOne({ where: { user_id: userOne.id } });
    expect(tokenAfterUpdate).toBeNull();
  });

  test('Should fail with validation errors', async () => {
    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        token: 'invalid',
        userId: 'invalid',
        password: '-',
      })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
    expect(errors.length).toBe(3);
  });

  test('Should fail because token is not found', async () => {
    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        token: v4(),
        userId: v4(),
        password: 'validPassword',
      })
      .expect(400);

    const { error } = response.body;
    expect(error).toBe(ERRORS.INVALID_RESET_TOKEN);
  });

  test('Should fail because token is invalid', async () => {
    const userOne = await createUser();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
    await db.Token.create({ user_id: userOne.id, token: hash });
    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        token: v4(),
        userId: userOne.id,
        password: 'validPassword',
      })
      .expect(400);

    const { error } = response.body;
    expect(error).toBe(ERRORS.INVALID_RESET_TOKEN);
  });
});
