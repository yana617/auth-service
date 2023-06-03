const {
  POSTGRES_DB: database,
  POSTGRES_USERNAME: username,
  POSTGRES_PASSWORD: password,
  POSTGRES_HOST: host,
  POSTGRES_PORT: port,
} = process.env;

const common = {
  dialect: 'postgres',
  username,
  password,
};

const config = {
  development: {
    ...common,
    database,
    host,
  },
  test: {
    ...common,
    database: 'test-db',
    host: 'localhost',
    port,
  },
  production: {
    ...common,
    database,
    host,
  },
};

export default config;
