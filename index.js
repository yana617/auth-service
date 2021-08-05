const app = require('./app');

const server = app.listen(process.env.PORT, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});
