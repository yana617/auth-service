const checkPermissions = require('../../middlewares/checkPermissions');
const { createUser, generateUser } = require('../fixtures/db');
const { ERRORS } = require('../../translations');

test('Should pass if user has correct permissions', async () => {
  const user = await createUser();
  const request = {
    user: {
      id: user.id,
      role_id: user.role_id,
    },
  };
  const response = {};
  const next = jest.fn();
  await checkPermissions(['EDIT_PROFILE'])(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('Should pass if user has correct admin permissions', async () => {
  const user = await createUser(generateUser(), 'ADMIN');
  const request = {
    user: {
      id: user.id,
      role_id: user.role_id,
    },
  };
  const response = {};
  const next = jest.fn();
  await checkPermissions(['EDIT_NOTICE'])(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('Should fail because of not enough permissions', async () => {
  const user = await createUser(generateUser(), 'VOLUNTEER');
  const request = {
    user: {
      id: user.id,
      role_id: user.role_id,
    },
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await checkPermissions(['EDIT_NOTICE'])(request, response, next);

  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});

test('Should fail because of not enough permissions', async () => {
  const user = await createUser();
  const request = {
    user: {
      id: user.id,
      role_id: user.role_id,
    },
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await checkPermissions(['CREATE_CLAIM'])(request, response, next);

  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});
