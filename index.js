const app = require('./app');

// require('./db/connect');

const server = app.listen(process.env.PORT, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});
