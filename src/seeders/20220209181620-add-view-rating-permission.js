'use strict';
const { v4 } = require('uuid');

const newPermission = 'VIEW_RATING';

module.exports = {
  async up (queryInterface, Sequelize) {
    const newPermissionId = v4();
    await queryInterface.bulkInsert('permissions', [{
      id: newPermissionId,
      name: newPermission,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);

    const volunteerRoleId = await queryInterface.rawSelect('roles', { where: { name: 'VOLUNTEER' } }, ['id']);
    const adminRoleId = await queryInterface.rawSelect('roles', { where: { name: 'ADMIN' } }, ['id']);

    return queryInterface.bulkInsert('role_permissions', [{
      id: v4(),
      role_id: volunteerRoleId,
      permission_id: newPermissionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      id: v4(),
      role_id: adminRoleId,
      permission_id: newPermissionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down (queryInterface, Sequelize) {
    const volunteerRoleId = await queryInterface.rawSelect('roles', { where: { name: 'VOLUNTEER' } }, ['id']);
    const adminRoleId = await queryInterface.rawSelect('roles', { where: { name: 'ADMIN' } }, ['id']);
    const newPermissionId = await queryInterface.rawSelect('permissions', { where: { name: newPermission } }, ['id']);

    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      'role_permissions',
      { [Op.and]: [{ role_id: volunteerRoleId }, { permission_id: newPermissionId }] }
    );
    await queryInterface.bulkDelete(
      'role_permissions',
      { [Op.and]: [{ role_id: adminRoleId }, { permission_id: newPermissionId }] }
    );
  }
};
