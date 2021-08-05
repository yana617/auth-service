const {
  POSTGRES_DB: database,
  POSTGRES_TEST_DB: testDatabase,
  POSTGRES_USERNAME: username,
  POSTGRES_PASSWORD: password,
  POSTGRES_HOST: host,
  POSTGRES_TEST_HOST: testHost,
} = process.env;

const common = {
  dialect: 'postgres',
  username,
  password,
};

module.exports = {
  development: {
    ...common,
    database,
    host,
  },
  test: {
    ...common,
    database: testDatabase,
    host: testHost,
  },
  production: {
    ...common,
    database,
    host,
  },
};
