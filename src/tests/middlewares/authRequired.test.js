const authRequired = require('../../middlewares/authRequired');
const { createUserAndGetToken } = require('../fixtures/db');
const { ERRORS } = require('../../translations');

test('Should pass if token correct', async () => {
  const token = await createUserAndGetToken();
  const request = {
    headers: {
      'x-access-token': token,
    },
    body: {},
    query: {},
  };
  const response = {};
  const next = jest.fn();
  authRequired(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('Should fail because of invalid token', () => {
  const request = {
    headers: {},
    body: {
      token: 'invalid',
    },
    query: {},
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  authRequired(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(401);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.INVALID_TOKEN,
  });
});

test('Should fail because token is not provided', () => {
  const request = {
    headers: {},
    body: {},
    query: {},
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  authRequired(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(401);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.INVALID_TOKEN,
  });
});
