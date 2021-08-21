const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser } = require('./fixtures/db');
const { ERRORS } = require('../translations');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('POST /register', () => {
  test('Should register new admin', async () => {
    const userOne = generateUser();
    const response = await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(201);

    const { data: user } = response.body;
    expect(user.name).toEqual(userOne.name);
    const userInDb = await db.User.findOne({ where: { phone: userOne.phone } });
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toEqual(userOne.name);
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
