import { ERRORS } from '#translations';
import permissionsService from '#services/permissions';

export default (permissions) => async (req, res, next) => {
  try {
    const { id: userId, role_id } = req.user;
    const allPermissions = await permissionsService.getAllPermissions(userId, role_id);
    if (permissions.every((p) => allPermissions.includes(p))) {
      return next();
    }
    res.status(403).json({
      success: false,
      error: ERRORS.FORBIDDEN,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
