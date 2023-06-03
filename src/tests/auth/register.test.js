import request from 'supertest';
import nock from 'nock';

import db from '#database';
import { ERRORS } from '#translations';
import * as emitHistoryAction from '#utils/emitHistoryAction';
import { generateUser, generateAft } from '../fixtures/db';
import app from '../../../app';

const { EVENTS_SERVICE_URL } = process.env;

jest.mock('utils/emitHistoryAction');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('POST /register', () => {
  beforeEach(async () => {
    nock(EVENTS_SERVICE_URL).post('/history-actions').reply(200, { success: true });
  });

  test('Should register new user', async () => {
    const userOne = generateUser();
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);
    const sendHistoryActionMock = jest.spyOn(emitHistoryAction, 'emitHistoryAction');

    const response = await request(app)
      .post('/auth/register')
      .send({
        ...userOne,
        additionalFields: [{
          additionalFieldTemplateId: aft.id,
          value: false,
        }],
      })
      .expect(201);
    expect(sendHistoryActionMock).toHaveBeenCalledTimes(1);

    const { data: user } = response.body;
    expect(user.name).toEqual(userOne.name);
    const userInDb = await db.User.findOne({ where: { phone: userOne.phone } });
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toEqual(userOne.name);

    // expect uaf was created
    const uafInDb = await db.UserAdditionalField.findAll({ where: { user_id: user.id } });
    expect(uafInDb).toBeDefined();
    expect(uafInDb.length).toBe(1);
    expect(uafInDb[0].additional_field_template_id).toBe(aft.id);
  });

  test('Should fail because user already exist', async () => {
    const userOne = generateUser();
    await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(201);

    const response = await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_ALREADY_EXISTS);
  });

  test('Should fail because user already exist (email case insensitive test)', async () => {
    const userOne = generateUser();
    const emailOne = 'test@example.com';
    const emailTwo = 'Test@example.com';
    await request(app)
      .post('/auth/register')
      .send({ ...userOne, email: emailOne })
      .expect(201);

    const response = await request(app)
      .post('/auth/register')
      .send({ ...userOne, email: emailTwo })
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_ALREADY_EXISTS);
  });

  test('Should fail because fields filled wrong', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({})
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });

  test('Should fail because additional fields did not sent correctly', async () => {
    const userOne = generateUser();
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);

    const response = await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.AFT_FILL_REQUIRED);
  });

  test('Should fail because birthday field from future', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        ...generateUser(),
        birthday: new Date('2100'),
      })
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });
});
