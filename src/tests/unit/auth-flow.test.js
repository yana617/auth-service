const request = require('supertest');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nock = require('nock');

const app = require('../../../app');
const db = require('../../database');
const { generateUser } = require('../fixtures/db');

const { BCRYPT_SALT: bcryptSalt, EVENTS_SERVICE_URL } = process.env;

jest.mock('../../utils/emitHistoryAction');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
  await db.Token.destroy({ where: {} });
  nock(EVENTS_SERVICE_URL).post('/history-actions').reply(200, { success: true });
});

test('I can register, login and get own info successfully', async () => {
  const userToSave = generateUser();
  const registerResponse = await request(app)
    .post('/auth/register')
    .send(userToSave)
    .expect(201);

  const { data: newUser } = registerResponse.body;
  expect(newUser.name).toEqual(userToSave.name);
  const userInDb = await db.User.findOne({ where: { phone: userToSave.phone } });
  expect(userInDb).toBeDefined();
  expect(userInDb.name).toEqual(userToSave.name);

  const loginResponse = await request(app)
    .post('/auth/login')
    .send(userToSave)
    .expect(200);

  const { data: loginUser } = loginResponse.body;

  expect(loginUser.name).toEqual(userToSave.name);
  expect(loginUser.token).not.toBeNull();

  const response = await request(app)
    .get('/users/me')
    .set('x-access-token', loginUser.token)
    .expect(200);

  const { data: user } = response.body;
  expect(user).toBeDefined();
  expect(user.name).toEqual(userToSave.name);
});

const createToken = async (userId) => {
  await db.Token.destroy({ where: {} });
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  await db.Token.create({ user_id: userId, token: hash });
  return resetToken;
};

test('I forgot password and can reset it successfully', async () => {
  const userOne = generateUser();
  const registerResponse = await request(app)
    .post('/auth/register')
    .send(userOne)
    .expect(201);

  const { data: newUser } = registerResponse.body;
  expect(newUser.name).toEqual(userOne.name);
  const userInDb = await db.User.findOne({ where: { phone: userOne.phone } });
  expect(userInDb).toBeDefined();
  expect(userInDb.name).toEqual(userOne.name);

  const updatedPassword = '111111';
  const forgotResponse = await request(app)
    .post('/auth/forgot-password')
    .send({ email: userOne.email })
    .expect(200);

  const { success } = forgotResponse.body;
  expect(success).toBeTruthy();

  const token = await createToken(userInDb.id);

  const resetResponse = await request(app)
    .post('/auth/reset-password')
    .send({
      token,
      userId: userInDb.id,
      password: updatedPassword,
    })
    .expect(200);

  const { success: resetSuccess } = resetResponse.body;
  expect(resetSuccess).toBeTruthy();

  const loginResponse = await request(app)
    .post('/auth/login')
    .send({ email: userOne.email, password: updatedPassword })
    .expect(200);

  const { data: loginUser } = loginResponse.body;

  expect(loginUser.name).toEqual(userOne.name);
  expect(loginUser.token).not.toBeNull();
});
