import validateUpdatingOwnData from '#middlewares/validateUpdatingOwnData';
import { ERRORS } from '#translations';
import { createUser } from '../fixtures/db';

test('Should pass if I update own data', async () => {
  const user = await createUser();
  const request = {
    user: {
      id: user.id,
    },
    params: {
      id: user.id,
    },
  };
  const response = {};
  const next = jest.fn();
  validateUpdatingOwnData(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('Should fail if I try update someone elses data', async () => {
  const user = await createUser();
  const request = {
    user: {
      id: user.id,
    },
    params: {
      id: 'someone elses id',
    },
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  validateUpdatingOwnData(request, response, next);

  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});
