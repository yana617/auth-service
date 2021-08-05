const { request } = require('supertest');

const { app } = require('../../app');
const db = require('../database');
const { userOne } = require('./fixtures/db');

describe('POST /register', () => {
  const thisDb = db;
  beforeAll(async () => {
    await thisDb.sequelize.sync({ force: true });
  });

  test('Should register new admin', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send(userOne)
      .expect(201);

    const { user } = response.body;
    expect(user.name).toEqual(userOne.name);
    const [userInDb] = await db.User.findAll({
      where: {
        id: userOne.id,
      },
    });
    expect(userInDb).not.toBeNull();
    expect(userInDb.name).toEqual(userOne.name);
  });

  afterAll(async () => {
    await thisDb.sequelize.close();
  });
});
