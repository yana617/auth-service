const jwt = require('jsonwebtoken');

const { TOKEN_KEY } = process.env;

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ success: false, error: 'A token is required for authentication' });
  }
  try {
    req.user = jwt.verify(token, TOKEN_KEY);
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid Token' });
  }
  return next();
};

module.exports = verifyToken;
