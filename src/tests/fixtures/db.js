const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');
const faker = require('faker');

const db = require('../../database');

const generateUser = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.datatype.number({ min: 1111111, max: 9999999 })}`,
  email: faker.internet.email(),
  password: faker.internet.password(),
  additional_fields: [],
});

const generateAft = () => ({
  id: v4(),
  label: faker.lorem.words(2),
  description: faker.lorem.words(15),
  icon: faker.image.imageUrl(),
});

const createUser = async (userToSave = generateUser()) => {
  const user = { ...userToSave };
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.hash = hash;
  user.salt = salt;
  await db.User.create(user);
  return user;
};

const createUserAndGetToken = async (userToSave = generateUser()) => {
  const user = await createUser(userToSave);
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.TOKEN_KEY,
    { expiresIn: '2d' },
  );
  return token;
};

module.exports = {
  generateUser,
  createUserAndGetToken,
  createUser,
  generateAft,
};
