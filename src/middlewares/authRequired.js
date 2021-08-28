const jwt = require('jsonwebtoken');

const { ERRORS } = require('../translations');

const { TOKEN_KEY } = process.env;

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ success: false, error: ERRORS.TOKEN_REQUIRED });
  }
  try {
    req.user = jwt.verify(token, TOKEN_KEY);
  } catch (err) {
    return res.status(401).json({ success: false, error: ERRORS.INVALID_TOKEN });
  }
  return next();
};

module.exports = verifyToken;
