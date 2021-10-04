const request = require('supertest');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { v4 } = require('uuid');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser, generateAft } = require('./fixtures/db');
const { ERRORS } = require('../translations');

const { BCRYPT_SALT: bcryptSalt } = process.env;

jest.mock('../utils/emitHistoryAction');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('POST /register', () => {
  test('Should register new user', async () => {
    const userOne = generateUser();
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);

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

describe('POST /forgot-password', () => {
  test('Should successfully send email to user', async () => {
    const userOne = await createUser();
    await request(app)
      .post('/auth/forgot-password')
      .send({
        email: userOne.email,
      })
      .expect(200);

    const token = await db.Token.findOne({ where: { user_id: userOne.id } });
    expect(token).toBeDefined();
  });

  test('Should fail with user not found error', async () => {
    const userOne = generateUser();
    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: userOne.email,
      })
      .expect(404);

    const { error } = response.body;
    expect(error).toBe(ERRORS.USER_EMAIL_NOT_FOUND);
  });

  test('Should fail with validation error', async () => {
    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'invalid',
      })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });
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
