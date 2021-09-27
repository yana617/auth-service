const { ERRORS } = require('../translations');
const { isAuthorized } = require('../services/auth');

const verifyToken = (req, res, next) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ success: false, error: ERRORS.INVALID_TOKEN });
  }
  return next();
};

module.exports = verifyToken;
