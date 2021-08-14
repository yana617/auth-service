const app = require('./app');

const server = app.listen(process.env.PORT || 1081, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});
