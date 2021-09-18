const { validationResult } = require('express-validator');

const userRepository = require('../repositories/UserRepository');
const guestRepository = require('../repositories/GuestRepository');
const permissionsService = require('../services/permissions');
const authService = require('../services/auth');

const getUsers = async (req, res) => {
  const { ids = [] } = req.body;

  const isAuthorized = authService.isAuthorized(req);
  let permissions = [];
  if (req.user) {
    const { id: userId, role_id: roleId } = req.user;
    permissions = await permissionsService.getAllPermissions(userId, roleId);
  }

  if (!isAuthorized || !permissions.includes('CREATE_CLAIM')) {
    const users = await userRepository.getShortUsersByIds(ids);
    return res.json({ success: true, data: users });
  }

  const users = await userRepository.getFullUsersByIds(ids);
  res.json({ success: true, data: users });
};

const getGuests = async (req, res) => {
  const { ids = [] } = req.body;

  const isAuthorized = authService.isAuthorized(req);
  let permissions = [];
  if (req.user) {
    const { id: userId, role_id: roleId } = req.user;
    permissions = await permissionsService.getAllPermissions(userId, roleId);
  }

  if (!isAuthorized || !permissions.includes('CREATE_CLAIM')) {
    const guests = await guestRepository.getShortGuestsByIds(ids);
    return res.json({ success: true, data: guests });
  }

  const guests = await guestRepository.getFullGuestsByIds(ids);
  res.json({ success: true, data: guests });
};

const getOrCreateGuest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

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
