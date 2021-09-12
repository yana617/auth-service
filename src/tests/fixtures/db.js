const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const faker = require('faker');

const db = require('../../database');
const { DEFAULT_ROLE } = require('../../database/constants');
const generateToken = require('../../utils/generateToken');

const generateUser = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.datatype.number({ min: 1111111, max: 9999999 })}`,
  email: faker.internet.email(),
  birthday: new Date(),
  password: faker.internet.password(),
  additionalFields: [],
});

const generateAft = () => ({
  id: v4(),
  label: faker.lorem.words(2),
  description: faker.lorem.words(15),
  icon: faker.image.imageUrl(),
});

const generateUaf = (user_id, additional_field_template_id) => ({
  id: v4(),
  user_id,
  additional_field_template_id,
  value: faker.datatype.boolean(),
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
  const token = generateToken(user);
  return token;
};

module.exports = {
  generateUser,
  createUserAndGetToken,
  createUser,
  generateAft,
  generateUaf,
};
