const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser } = require('./fixtures/db');
const { ERRORS } = require('../translations');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('POST /register', () => {
  test('Should register new user', async () => {
    const userToSave = generateUser();
    const response = await request(app)
      .post('/auth/register')
      .send(userToSave)
      .expect(201);

    const { data: user } = response.body;
    expect(user.name).toEqual(userToSave.name);
    const userInDb = await db.User.findOne({ where: { phone: userToSave.phone } });
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toEqual(userToSave.name);
  });

  test('Should fail because user already exist', async () => {
    const userToSave = generateUser();
    await request(app)
      .post('/auth/register')
      .send(userToSave)
      .expect(201);

    const response = await request(app)
      .post('/auth/register')
      .send(userToSave)
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
    const userToSave = generateUser();
    await request(app)
      .post('/auth/register')
      .send(userToSave)
      .expect(201);

    const response = await request(app)
      .post('/auth/login')
      .send(userToSave)
      .expect(200);

    const { data: user } = response.body;

    expect(user.name).toEqual(userToSave.name);
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
    const userToSave = generateUser();
    await createUser(userToSave);
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: userToSave.email,
        password: 'no',
      })
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.AUTH_ERROR);
  });
});
