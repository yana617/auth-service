const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser, createUserAndGetToken } = require('./fixtures/db');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /users/:id', () => {
  test('Should return user', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);

    const response = await request(app)
      .get('/users/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).not.toBeNull();
    expect(user.name).toEqual(userOne.name);
  });
});

describe('GET /users', () => {
  beforeEach(async () => {
    await createUser();
    await createUser();
  });

  test('Should return all users without queries', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(3);
  });

  test('Should return limited users', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?limit=1')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(1);
  });

  test('Should return users after skip', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?skip=1')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(2);
  });

  test('Should return sorted users', async () => {
    const token = await createUserAndGetToken();

    const usersInDb = await db.User.findAll({ raw: true });
    const sortedByNameUsers = usersInDb.sort((user1, user2) => user1.surname
      .localeCompare(user2.surname));
    const sortedUsersIds = sortedByNameUsers.map((user) => user.id);

    const response = await request(app)
      .get('/users?sortBy=surname')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(3);
    const usersFromResponseIds = users.map((user) => user.id);
    expect(usersFromResponseIds).toEqual(sortedUsersIds);
  });

  test('Should return ordered users', async () => {
    const token = await createUserAndGetToken();

    const usersInDb = await db.User.findAll({ raw: true });
    const sortedByNameUsers = usersInDb.sort((user1, user2) => user2.name
      .localeCompare(user1.name));
    const sortedUsersIds = sortedByNameUsers.map((user) => user.id);

    const response = await request(app)
      .get('/users?order=desc')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(3);
    const usersFromResponseIds = users.map((user) => user.id);
    expect(usersFromResponseIds).toEqual(sortedUsersIds);
  });

  test('Should search correctly', async () => {
    const token = await createUserAndGetToken();
    const user = { ...generateUser(), name: 'test', surname: 'user' };
    await createUser(user);

    const response = await request(app)
      .get('/users?search=test%20u')
      .set('x-access-token', token)
      .expect(200);

    const { data: users } = response.body;
    expect(users.length).toBe(1);
    expect(users[0].name).toEqual(user.name);
  });

  test('Should fail because of incorrect limit query', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?limit=55')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect skip query', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?skip=abc')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect search query', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?search=invalidInvalidLongInvalidInvalidLong')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect order query', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?order=invalid')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect sortBy query', async () => {
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get('/users?sortBy=invalid')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });
});
