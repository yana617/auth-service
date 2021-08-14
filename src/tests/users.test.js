const request = require('supertest');
const uuid = require('uuid');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser, createUserAndGetToken } = require('./fixtures/db');
const { ERRORS } = require('../translations');
const { rolePermissions } = require('../database/constants');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /users/:id', () => {
  test('Should return user', async () => {
    const userToSave = generateUser();
    const token = await createUserAndGetToken(userToSave, 'VOLUNTEER');

    const response = await request(app)
      .get(`/users/${userToSave.id}`)
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).toBeDefined();
    expect(user.name).toEqual(userToSave.name);
  });

  test('Should fail because you request not yours information', async () => {
    const userOne = generateUser();
    const userTwo = generateUser();
    await createUser(userOne);
    const token = await createUserAndGetToken(userTwo);

    const response = await request(app)
      .get(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });
});

describe('GET /users/:id/permissions', () => {
  test('Should return user\'s permission', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get(`/users/${userOne.id}/permissions`)
      .set('x-access-token', token)
      .expect(200);

    const { data: permissions } = response.body;
    expect(permissions).not.toBeNull();
    expect(permissions.rolePermissions).toEqual(rolePermissions.USER);
    expect(permissions.additionalPermissions.length).toBe(0);
  });

  test('Should return user\'s permission', async () => {
    const userOne = await createUser(generateUser(), 'VOLUNTEER');
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get(`/users/${userOne.id}/permissions`)
      .set('x-access-token', token)
      .expect(200);

    const { data: permissions } = response.body;
    expect(permissions).not.toBeNull();
    expect(permissions.rolePermissions).toEqual(rolePermissions.VOLUNTEER);
    expect(permissions.additionalPermissions.length).toBe(0);
  });

  test('Should fail because of not enough permissions', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken();

    const response = await request(app)
      .get(`/users/${userOne.id}/permissions`)
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });

  test('Should fail with user not found error', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get(`/users/${uuid.v4()}/permissions`)
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_NOT_FOUND);
  });
});

describe('PUT /users/:id/role', () => {
  test('Should update role', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const roleToSet = 'VOLUNTEER';

    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: roleToSet })
      .set('x-access-token', token)
      .expect(200);

    const { success } = response.body;
    expect(success).toBe(true);
    const userInDb = await db.User.findByPk(userOne.id);
    expect(userInDb).toBeDefined();
    const role = await db.Role.findOne({ where: { name: roleToSet } });
    expect(userOne.role_id).not.toBe(role.id);
    expect(userInDb.role_id).toBe(role.id);
  });

  test('Should fail with can not update your own role', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne, 'ADMIN');
    const roleToSet = 'VOLUNTEER';

    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: roleToSet })
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.UPDATE_OWN_ROLE_FORBIDDEN);
  });

  test('Should fail because not enough permissions', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');
    const roleToSet = 'VOLUNTEER';

    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: roleToSet })
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.FORBIDDEN);
  });

  test('Should fail because role is not provided', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({})
      .set('x-access-token', token)
      .expect(400);

    const { error } = response.body;
    expect(error).toBe(ERRORS.ROLE_REQUIRED);
  });

  test('Should fail because role is not exist', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: 'invalid' })
      .set('x-access-token', token)
      .expect(500);
  });

  test('Should fail because user not found', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: 'VOLUNTEER' })
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toBe(ERRORS.USER_NOT_FOUND);
  });
});

describe('PUT /users/:id', () => {
  test('Should edit user correctly', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne, 'VOLUNTEER');
    const editedName = 'edited';

    const response = await request(app)
      .put(`/users/${userOne.id}`)
      .send({ ...userOne, name: editedName })
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).toBeDefined();
    expect(user.name).toEqual(editedName);

    const userInDb = await db.User.findOne({ where: { phone: userOne.phone } });
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toEqual(editedName);
  });

  test('Should fail because you try to update not yours information', async () => {
    const userOne = generateUser();
    const userTwo = generateUser();
    await createUser(userOne);
    const token = await createUserAndGetToken(userTwo);

    const response = await request(app)
      .put(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });

  test('Should fail because of invalid body', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);

    const response = await request(app)
      .put(`/users/${userOne.id}`)
      .send({})
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });
});
