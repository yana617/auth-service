import 'regenerator-runtime/runtime';
import dotenv from 'dotenv';

import db from '#database';

jest.setTimeout(10000);

dotenv.config();

async function initDatabase() {
  try {
    await db.sequelize.sync();
  } catch (error) {
    console.error('Unable to initialize database:', error);
  }
}

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});
