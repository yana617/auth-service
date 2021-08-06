const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../../database');

const userOne = {
  id: '74a1fda1-8e08-4060-beeb-7e2f964459e1',
  name: 'Test',
  surname: 'TestSurname',
  phone: '375291111111',
  email: 'test@example.com',
  password: 'testTest',
  additional_fields: [],
};

const userTwo = {
  id: '74a1fda9-8e08-4060-beeb-7e2f964459e1',
  name: 'Test2',
  surname: 'Test2Surname',
  phone: '375291111112',
  email: 'test2@example.com',
  password: 'testTest2',
  additional_fields: [],
};

const createUser = async (userToSave) => {
  const user = { ...userToSave };
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.hash = hash;
  user.salt = salt;
  await db.User.create(user);
  return user;
};

const createUserAndGetToken = async (userToSave) => {
  const user = await createUser(userToSave);
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.TOKEN_KEY,
    { expiresIn: '2d' },
  );
  return token;
};

module.exports = {
  userOne,
  createUserAndGetToken,
  createUser,
  userTwo,
};
