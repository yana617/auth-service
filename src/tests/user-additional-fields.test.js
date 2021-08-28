const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const { ERRORS } = require('../translations');
const {
  generateUser,
  createUser,
  createUserAndGetToken,
  generateAft,
  generateUaf,
} = require('./fixtures/db');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('GET /user-additional-fields', () => {
  test('Should return user additional fields', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);
    await db.UserAdditionalField.create(generateUaf(userOne.id, aft.id));
    await db.UserAdditionalField.create(generateUaf(userOne.id, aft.id));

    const response = await request(app)
      .get('/user-additional-fields/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: uaf } = response.body;
    expect(uaf).toBeDefined();
    expect(uaf.length).toEqual(2);
  });

  test('Should return user additional fields', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);

    const response = await request(app)
      .get('/user-additional-fields/me')
      .set('x-access-token', token)
      .expect(200);

    const { data: uaf } = response.body;
    expect(uaf).toBeDefined();
    expect(uaf.length).toEqual(0);
  });
});

describe('PUT /user-additional-fields/:id', () => {
  test('Should return updated user additional fields', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);
    const uaf = generateUaf(userOne.id, aft.id);
    await db.UserAdditionalField.create(uaf);

    const updatedValue = false;
    const response = await request(app)
      .put(`/user-additional-fields/${uaf.id}`)
      .send({ ...uaf, value: updatedValue })
      .set('x-access-token', token)
      .expect(200);

    const { data: updatedUaf } = response.body;
    expect(updatedUaf).toBeDefined();
    expect(updatedUaf.value).toBe(updatedValue);

    const uafInDb = await db.UserAdditionalField.findByPk(uaf.id);
    expect(uafInDb).toBeDefined();
    expect(uafInDb.value).toEqual(updatedValue);
  });

  test('Should fail with not found error when updating not yours data', async () => {
    const userOne = await createUser();
    const token = await createUserAndGetToken(generateUser());
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);
    const uaf = generateUaf(userOne.id, aft.id);
    await db.UserAdditionalField.create(uaf);

    const response = await request(app)
      .put(`/user-additional-fields/${uaf.id}`)
      .send({ ...uaf, value: false })
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toBeDefined();
    expect(error).toBe(ERRORS.UAF_NOT_FOUND);
  });

  test('Should fail with validation error', async () => {
    const userOne = generateUser();
    const token = await createUserAndGetToken(userOne);
    const aft = generateAft();
    await db.AdditionalFieldTemplate.create(aft);
    const uaf = generateUaf(userOne.id, aft.id);
    await db.UserAdditionalField.create(uaf);

    const response = await request(app)
      .put(`/user-additional-fields/${uaf.id}`)
      .send({ ...uaf, value: 'hi' })
      .set('x-access-token', token)
      .expect(400);

    const { error } = response.body;
    expect(error).toBeDefined();
    expect(error).toBe(ERRORS.VALUE_BOOLEAN);
  });
});
