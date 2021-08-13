require('dotenv').config();
const db = require('../../database');

beforeEach(async () => {
  await db.sequelize.sync({});
});

afterAll(async () => {
  await db.sequelize.close();
});
