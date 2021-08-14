const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');
const faker = require('faker');

const db = require('../../database');
const { DEFAULT_ROLE } = require('../../database/constants');

const generateUser = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.datatype.number({ min: 1111111, max: 9999999 })}`,
  email: faker.internet.email(),
  password: faker.internet.password(),
  additional_fields: [],
});

const createUser = async (userToSave = generateUser(), role = DEFAULT_ROLE) => {
  const user = { ...userToSave };
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.hash = hash;
  user.salt = salt;
  const { id: role_id } = await db.Role.findOne({ where: { name: role } });
  user.role_id = role_id;
  await db.User.create(user);
  return user;
};

const createUserAndGetToken = async (userToSave = generateUser(), role = DEFAULT_ROLE) => {
  const user = await createUser(userToSave, role);
  const token = jwt.sign(
    { id: user.id, role_id: user.role_id },
    process.env.TOKEN_KEY,
    { expiresIn: '2d' },
  );
  return token;
};

module.exports = {
  generateUser,
  createUserAndGetToken,
  createUser,
};
