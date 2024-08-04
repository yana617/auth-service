import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import db from '#database';
import { DEFAULT_ROLE } from '#database/constants';
import generateToken from '#utils/generateToken';

const generateUser = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.number.int({ min: 1111111, max: 9999999 })}`,
  email: faker.internet.email(),
  birthday: new Date(),
  password: faker.internet.password(),
  additionalFields: [],
});

const generateGuest = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.number.int({ min: 1111111, max: 9999999 })}`,
});

const generateAft = () => ({
  id: v4(),
  label: faker.lorem.words(2),
  description: faker.lorem.words(15),
  icon: faker.string.sample(5),
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
  const roleInDb = await db.Role.findOne({ where: { name: role } });
  if (!roleInDb) {
    throw new Error('Role not found');
  }
  user.role_id = roleInDb.id;
  await db.User.create(user);
  return user;
};

const createUserAndGetToken = async (userToSave = generateUser(), role = DEFAULT_ROLE) => {
  const user = await createUser(userToSave, role);
  const token = generateToken(user);
  return token;
};

export {
  generateUser,
  createUserAndGetToken,
  createUser,
  generateAft,
  generateUaf,
  generateGuest,
};
