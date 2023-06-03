import { ERRORS } from '#translations';

export default async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: idToUpdate } = req.params;
  if (idToUpdate !== userId) {
    return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
  }
  next();
};
