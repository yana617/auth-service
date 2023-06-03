import request from 'supertest';

import db from '#database';
import { ERRORS } from '#translations';
import { roles } from '#database/constants';
import { generateUser, createUserAndGetToken } from './fixtures/db';
import app from '../../app';

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
    const token = await createUserAndGetToken(generateUser(), 'USER');

    const response = await request(app)
      .get('/roles')
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });
});
