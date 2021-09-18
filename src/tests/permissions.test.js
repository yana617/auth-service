const request = require('supertest');
const { v4 } = require('uuid');

const app = require('../../app');
const db = require('../database');
const { generateUser, createUser, createUserAndGetToken } = require('./fixtures/db');
const { ERRORS } = require('../translations');
const { permissions, rolePermissions, permissionsForbiddenToBeAdditional } = require('../database/constants');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
});

describe('GET /permissions', () => {
  test('Should return all permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get('/permissions')
      .set('x-access-token', token)
      .expect(200);

    const { data: permissionsResponse } = response.body;
    const expected = permissions.filter((p) => !permissionsForbiddenToBeAdditional.includes(p));
    expect(permissionsResponse).not.toBeNull();
    expect(permissionsResponse.length).toBe(expected.length);
  });

  test('Should fail because you do not have enough permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/permissions')
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });
});

describe('PUT /permissions', () => {
  test('Should update permissions correctly (add)', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const permissionToAdd = 'EDIT_NOTICE';

    await request(app)
      .put('/permissions')
      .send({
        userId: userOne.id,
        permissions: {
          [permissionToAdd]: true,
        },
      })
      .set('x-access-token', token)
      .expect(200);

    const permission = await db.Permission.findOne({ where: { name: permissionToAdd } });
    let userPermissionsIds = await db.UserPermission.findAll({ where: { user_id: userOne.id } });
    userPermissionsIds = userPermissionsIds.map((p) => p.permission_id);
    expect(userPermissionsIds.length).toBe(1);
    expect(userPermissionsIds.includes(permission.id)).toBe(true);
  });

  test('Should update permissions correctly (remove)', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const permissionToRemove = 'EDIT_NOTICE';

    const permission = await db.Permission.findOne({ where: { name: permissionToRemove } });
    await db.UserPermission.create({ user_id: userOne.id, permission_id: permission.id });

    let userPermissionsIds = await db.UserPermission.findAll({ where: { user_id: userOne.id } });
    userPermissionsIds = userPermissionsIds.map((p) => p.permission_id);
    expect(userPermissionsIds.length).toBe(1);
    expect(userPermissionsIds.includes(permission.id)).toBe(true);

    await request(app)
      .put('/permissions')
      .send({
        userId: userOne.id,
        permissions: {
          [permissionToRemove]: false,
        },
      })
      .set('x-access-token', token)
      .expect(200);

    userPermissionsIds = await db.UserPermission.findAll({ where: { user_id: userOne.id } });
    userPermissionsIds = userPermissionsIds.map((p) => p.permission_id);
    expect(userPermissionsIds.length).toBe(0);
  });

  test('Should fail because role with same permissions exist', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const permissionsToAdd = {
      CREATE_CLAIM: true,
      EDIT_CLAIM: true,
      DELETE_CLAIM: true,
      VIEW_USERS: true,
    };

    const response = await request(app)
      .put('/permissions')
      .send({
        userId: userOne.id,
        permissions: permissionsToAdd,
      })
      .set('x-access-token', token)
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.ROLE_WITH_SAME_PERMISSIONS_EXIST);
  });

  test('Should fail because you do not have enough permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .put('/permissions')
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });

  test('Should fail because permissions field is missing', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .put('/permissions')
      .send({})
      .set('x-access-token', token)
      .expect(400);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.PERMISSIONS_REQUIRED);
  });

  test('Should fail because user not found', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .put('/permissions')
      .send({
        userId: v4(),
        permissions: {},
      })
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_NOT_FOUND);
  });
});

describe('GET /permissions/me', () => {
  test('Should return no permissions for unauthorized user', async () => {
    const response = await request(app)
      .get('/permissions/me')
      .expect(200);

    const { data: permissionsResponse } = response.body;
    expect(permissionsResponse).not.toBeNull();
    expect(permissionsResponse.length).toBe(0);
  });

  test('Should return all user permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'USER');

    const response = await request(app)
      .get('/permissions/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: permissionsResponse } = response.body;
    expect(permissionsResponse).not.toBeNull();
    expect(permissionsResponse.length).toBe(rolePermissions.USER.length);
  });

  test('Should return all admin permissions', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .get('/permissions/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: permissionsResponse } = response.body;
    expect(permissionsResponse).not.toBeNull();
    expect(permissionsResponse.length).toBe(rolePermissions.ADMIN.length);
  });

  test('Should return all user+additional permissions', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne, 'USER');
    const permission = await db.Permission.findOne({ where: { name: 'EDIT_NOTICE' } });
    await db.UserPermission.create({ user_id: userOne.id, permission_id: permission.id });

    const response = await request(app)
      .get('/permissions/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: permissionsResponse } = response.body;
    const expectedRolePermissionsLength = rolePermissions.USER.length;

    expect(permissionsResponse).not.toBeNull();
    expect(permissionsResponse.length).toBe(expectedRolePermissionsLength + 1);
  });
});
