import { ERRORS } from '#translations';
import authService from '#services/auth';

const verifyToken = (req, res, next) => {
  if (!authService.isAuthorized(req)) {
    return res.status(401).json({ success: false, error: ERRORS.INVALID_TOKEN });
  }
  return next();
};

export default verifyToken;
