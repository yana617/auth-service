"use strict";
const { v4 } = require("uuid");

const newViewPermission = "VIEW_ANIMALS";
const newEditPermission = "EDIT_ANIMAL";
const newCreatePermission = "CREATE_ANIMAL";
const newDeletePermission = "DELETE_ANIMAL";

module.exports = {
  async up(queryInterface, Sequelize) {
    const volunteerRoleId = await queryInterface.rawSelect(
      "roles",
      { where: { name: "VOLUNTEER" } },
      ["id"]
    );
    const adminRoleId = await queryInterface.rawSelect(
      "roles",
      { where: { name: "ADMIN" } },
      ["id"]
    );

    const newViewPermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newViewPermission } },
      ["id"]
    );
    const newEditPermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newEditPermission } },
      ["id"]
    );
    const newCreatePermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newCreatePermission } },
      ["id"]
    );
    const newDeletePermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newDeletePermission } },
      ["id"]
    );

    await queryInterface.bulkInsert("role_permissions", [
      {
        id: v4(),
        role_id: volunteerRoleId,
        permission_id: newViewPermissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: v4(),
        role_id: adminRoleId,
        permission_id: newViewPermissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: v4(),
        role_id: adminRoleId,
        permission_id: newEditPermissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: v4(),
        role_id: adminRoleId,
        permission_id: newCreatePermissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: v4(),
        role_id: adminRoleId,
        permission_id: newDeletePermissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down() {},
};
