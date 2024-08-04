import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import db from '#database';
import { ERRORS } from '#translations';
import { rolePermissions, DEFAULT_ROLE } from '#database/constants';
import { generateUser, createUser, createUserAndGetToken } from './fixtures/db';
import app from '../../app';

const { EVENTS_SERVICE_URL } = process.env;

jest.mock('utils/emitHistoryAction');

let emitHistoryAction;
(async function () {
  emitHistoryAction = (await import('utils/emitHistoryAction'));
}());

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('GET /users/me', () => {
  test('Should return user', async () => {
    const userToSave = generateUser();
    const token = await createUserAndGetToken(userToSave, 'VOLUNTEER');

    const response = await request(app)
      .get('/users/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).toBeDefined();
    expect(user.name).toEqual(userToSave.name);
  });

  test('Should fail because you send invalid token', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('x-access-token', 'invalid')
      .expect(401);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.INVALID_TOKEN);
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
    expect(permissions.userPermissions.length).toBe(0);
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
    expect(permissions.userPermissions.length).toBe(0);
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
      .get(`/users/${v4()}/permissions`)
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_NOT_FOUND);
  });
});

describe('PUT /users/:id/role', () => {
  beforeEach(async () => {
    nock(EVENTS_SERVICE_URL).post('/history-actions').reply(200, { success: true });
  });

  test('Should update role', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const roleToSet = 'VOLUNTEER';

    const emitHistoryActionMock = jest.spyOn(emitHistoryAction, 'emitHistoryAction');
    const response = await request(app)
      .put(`/users/${userOne.id}/role`)
      .send({ role: roleToSet })
      .set('x-access-token', token)
      .expect(200);
    expect(emitHistoryActionMock).toHaveBeenCalledTimes(1);

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

describe('GET /users', () => {
  beforeEach(async () => {
    await createUser();
    await createUser(generateUser(), 'VOLUNTEER');
  });

  test('Should return all users without queries', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(3);

    const [user] = users;
    expect(user.user_additional_fields).toBeDefined();
  });

  test('Should return limited users', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?limit=1')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(1);
  });

  test('Should return users after skip', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?skip=1')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(2);
  });

  test('Should return sorted users', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const usersInDb = await db.User.findAll({ raw: true });
    const sortedByNameUsers = usersInDb.sort((user1, user2) => user1.surname
      .localeCompare(user2.surname));
    const sortedUsersIds = sortedByNameUsers.map((user) => user.id);

    const response = await request(app)
      .get('/users?sortBy=surname')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(3);
    const usersFromResponseIds = users.map((user) => user.id);
    expect(usersFromResponseIds).toEqual(sortedUsersIds);
  });

  test('Should return ordered users', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const usersInDb = await db.User.findAll({ raw: true });
    const sortedByNameUsers = usersInDb.sort((user1, user2) => user2.name
      .localeCompare(user1.name));
    const sortedUsersIds = sortedByNameUsers.map((user) => user.id);

    const response = await request(app)
      .get('/users?order=desc')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(3);
    const usersFromResponseIds = users.map((user) => user.id);
    expect(usersFromResponseIds).toEqual(sortedUsersIds);
  });

  test('Should search correctly', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');
    const user = { ...generateUser(), name: 'test', surname: 'user' };
    await createUser(user);

    const response = await request(app)
      .get('/users?search=test%20u')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users } } = response.body;
    expect(users.length).toBe(1);
    expect(users[0].name).toEqual(user.name);
  });

  const testCases = [{
    tokenRole: 'VOLUNTEER',
    rolesFilter: 'USER',
    expectedUsersCount: 1,
  }, {
    tokenRole: 'ADMIN',
    rolesFilter: 'VOLUNTEER,ADMIN',
    expectedUsersCount: 2,
  }, {
    tokenRole: 'VOLUNTEER',
    rolesFilter: 'ADMIN',
    expectedUsersCount: 0,
  }];

  test.each(testCases)(
    'Should filter by roles correctly',
    async ({ tokenRole, rolesFilter, expectedUsersCount }) => {
      const token = await createUserAndGetToken(generateUser(), tokenRole);

      const response = await request(app)
        .get(`/users?roles=${rolesFilter}`)
        .set('x-access-token', token)
        .expect(200);

      const { data: { users } } = response.body;
      expect(users.length).toBe(expectedUsersCount);
    },
  );

  test('pagination should work correctly', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const creatingUsers = Array.from(Array(15).keys()).map(() => createUser());
    await Promise.all(creatingUsers);

    const response = await request(app)
      .get('/users?roles=USER')
      .set('x-access-token', token)
      .expect(200);

    const { data: { users, total } } = response.body;
    expect(users.length).toBe(15);
    expect(total).toBe(16);
  });

  test('Should fail because of incorrect limit query', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?limit=55')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect skip query', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?skip=abc')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect search query', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?search=invalidInvalidLongInvalidInvalidLong')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect order query', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?order=invalid')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because of incorrect sortBy query', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get('/users?sortBy=invalid')
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });
});

describe('GET /users/:id', () => {
  test('Should return user correctly', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(200);

    const { data: user } = response.body;
    expect(user).toBeDefined();
    expect(user.name).toEqual(userOne.name);
    expect(user.role).toBe(DEFAULT_ROLE);
  });

  test('Should fail with forbidden error', async () => {
    const userOne = createUser();
    const token = await createUserAndGetToken(generateUser());

    const response = await request(app)
      .get(`/users/${userOne.id}`)
      .set('x-access-token', token)
      .expect(403);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.FORBIDDEN);
  });

  test('Should fail with user not found error', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .get(`/users/${v4()}`)
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toEqual(ERRORS.USER_NOT_FOUND);
  });
});
