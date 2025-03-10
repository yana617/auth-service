"use strict";
const { v4 } = require('uuid');

const previousPermissions = [
  "VIEW_PROFILE",
  "EDIT_PROFILE",
  "CREATE_CLAIM",
  "EDIT_CLAIM",
  "DELETE_CLAIM",
  "VIEW_USERS",
  "CREATE_NOTICE",
  "EDIT_NOTICE",
  "DELETE_NOTICE",
  "CREATE_ADDITIONAL_FIELD_TEMPLATE",
  "EDIT_ADDITIONAL_FIELD_TEMPLATE",
  "DELETE_ADDITIONAL_FIELD_TEMPLATE",
  "EDIT_PERMISSIONS",
  "CREATE_CLAIM_FOR_UNREGISTERED_USERS",
  "VIEW_RATING",
];

const newViewPermission = "VIEW_ANIMALS";
const newEditPermission = "EDIT_ANIMAL";
const newCreatePermission = "CREATE_ANIMAL";
const newDeletePermission = "DELETE_ANIMAL";

const newPermissions = previousPermissions.concat([
  newViewPermission,
  newEditPermission,
  newCreatePermission,
  newDeletePermission,
]);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("permissions", "name", {
      type: Sequelize.TEXT,
    });
    await queryInterface.sequelize
      .query("drop type enum_permissions_name;")
      .then(() =>
        queryInterface.changeColumn("permissions", "name", {
          type: Sequelize.ENUM(...newPermissions),
        })
      );

    // insert

    const newViewPermissionId = v4();
    await queryInterface.bulkInsert("permissions", [
      {
        id: newViewPermissionId,
        name: newViewPermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const newEditPermissionId = v4();
    await queryInterface.bulkInsert("permissions", [
      {
        id: newEditPermissionId,
        name: newEditPermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const newCreatePermissionId = v4();
    await queryInterface.bulkInsert("permissions", [
      {
        id: newCreatePermissionId,
        name: newCreatePermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const newDeletePermissionId = v4();
    await queryInterface.bulkInsert("permissions", [
      {
        id: newDeletePermissionId,
        name: newDeletePermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

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

  async down({ sequelize: { query } }, Sequelize) {
    await queryInterface.changeColumn("permissions", "name", {
      type: Sequelize.TEXT,
    });
    await queryInterface.sequelize
      .query("drop type enum_permissions_name;")
      .then(() =>
        queryInterface.changeColumn("permissions", "name", {
          type: Sequelize.ENUM(...previousPermissions),
        })
      );

    // delete

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
    const newCreatePermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newCreatePermission } },
      ["id"]
    );
    const newEditPermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newEditPermission } },
      ["id"]
    );
    const newDeletePermissionId = await queryInterface.rawSelect(
      "permissions",
      { where: { name: newDeletePermission } },
      ["id"]
    );

    const Op = Sequelize.Op;
    await queryInterface.bulkDelete("role_permissions", {
      [Op.and]: [
        { role_id: volunteerRoleId },
        { permission_id: newViewPermissionId },
      ],
    });
    await queryInterface.bulkDelete("role_permissions", {
      [Op.and]: [
        { role_id: adminRoleId },
        { permission_id: newViewPermissionId },
      ],
    });
    await queryInterface.bulkDelete("role_permissions", {
      [Op.and]: [
        { role_id: adminRoleId },
        { permission_id: newEditPermissionId },
      ],
    });
    await queryInterface.bulkDelete("role_permissions", {
      [Op.and]: [
        { role_id: adminRoleId },
        { permission_id: newCreatePermissionId },
      ],
    });
    await queryInterface.bulkDelete("role_permissions", {
      [Op.and]: [
        { role_id: adminRoleId },
        { permission_id: newDeletePermissionId },
      ],
    });

    await queryInterface.bulkDelete("permissions", {
      id: {
        [Sequelize.Op.in]: [
          newViewPermissionId,
          newEditPermissionId,
          newCreatePermissionId,
          newDeletePermissionId,
        ],
      },
    });
  },
};
