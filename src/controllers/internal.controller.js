const userRepository = require('../repositories/UserRepository');
const guestRepository = require('../repositories/GuestRepository');
const permissionsService = require('../services/permissions');
const authService = require('../services/auth');

const hasPermissions = async (req) => {
  const isAuthorized = authService.isAuthorized(req);
  let permissions = [];
  if (req.user) {
    const { id: userId, role_id: roleId } = req.user;
    permissions = await permissionsService.getAllPermissions(userId, roleId);
  }

  if (!isAuthorized || !permissions.includes('CREATE_CLAIM')) {
    return false;
  }
  return true;
};

const getUsers = async (req, res) => {
  const { ids = [] } = req.body;
  const hasFullPermissions = await hasPermissions(req);
  let users = [];
  if (!hasFullPermissions) {
    users = await userRepository.getShortUsersByIds(ids);
  } else {
    users = await userRepository.getFullUsersByIds(ids);
  }
  res.json({ success: true, data: users });
};

const getGuests = async (req, res) => {
  const { ids = [] } = req.body;
  const hasFullPermissions = await hasPermissions(req);
  let guests = [];
  if (!hasFullPermissions) {
    guests = await guestRepository.getShortGuestsByIds(ids);
  } else {
    guests = await guestRepository.getFullGuestsByIds(ids);
  }
  res.json({ success: true, data: guests });
};

const getOrCreateGuest = async (req, res) => {
  const { name, surname, phone } = req.body;
  let guest = await guestRepository.getByPhone(phone);
  if (!guest) {
    guest = await guestRepository.create({ name, surname, phone });
  }
  res.json({ success: true, data: guest });
};

module.exports = {
  getUsers,
  getGuests,
  getOrCreateGuest,
};
