import jwt from 'jsonwebtoken';

const { TOKEN_KEY } = process.env;

const isAuthorized = (req) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    return false;
  }
  try {
    req.user = jwt.verify(token, TOKEN_KEY);
  } catch (err) {
    return false;
  }
  return true;
};

export default {
  isAuthorized,
};
