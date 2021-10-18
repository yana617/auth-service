const request = require('supertest');
const { v4 } = require('uuid');

const app = require('../../app');
const db = require('../database');
const { ERRORS } = require('../translations');
const {
  generateUser,
  createUserAndGetToken,
  generateAft,
  createUser,
} = require('./fixtures/db');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.AdditionalFieldTemplate.destroy({ where: {} });
  await db.UserAdditionalField.destroy({ where: {} });
});

describe('GET /additional-field-templates', () => {
  test('Should return additional field templates', async () => {
    await db.AdditionalFieldTemplate.create(generateAft());
    await db.AdditionalFieldTemplate.create(generateAft());
    const token = await createUserAndGetToken(generateUser());

    const response = await request(app)
      .get('/additional-field-templates')
      .set('x-access-token', token)
      .expect(200);

    const { data: aft } = response.body;
    expect(aft).toBeDefined();
    expect(aft.length).toEqual(2);
  });
});

describe('POST /additional-field-templates', () => {
  test('Should save and return new additional field template', async () => {
    const userOne = await createUser();
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .post('/additional-field-templates')
      .send(aftOne)
      .set('x-access-token', token)
      .expect(201);

    const { data: aft } = response.body;
    expect(aft.label).toEqual(aftOne.label);
    const aftInDb = await db.AdditionalFieldTemplate.findByPk(aft.id);
    expect(aftInDb).toBeDefined();
    expect(aftInDb.label).toEqual(aftOne.label);

    // expect uaf was created
    const uafInDb = await db.UserAdditionalField.findAll({ where: { user_id: userOne.id } });
    expect(uafInDb).toBeDefined();
    expect(uafInDb.length).toBe(1);
  });

  test('Should save without icon and return new additional field template', async () => {
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .post('/additional-field-templates')
      .send({ ...aftOne, icon: undefined })
      .set('x-access-token', token)
      .expect(201);

    const { data: aft } = response.body;
    expect(aft.label).toEqual(aftOne.label);
    const aftInDb = await db.AdditionalFieldTemplate.findByPk(aft.id);
    expect(aftInDb).toBeDefined();
    expect(aftInDb.label).toEqual(aftOne.label);
  });

  test('Should fail with validation errors', async () => {
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .post('/additional-field-templates')
      .send({ ...aftOne, label: '' })
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with validation errors', async () => {
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .post('/additional-field-templates')
      .send({ ...aftOne, description: '' })
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });
});

describe('PUT /additional-field-templates', () => {
  test('Should update and return edited additional field template', async () => {
    const aftOne = generateAft();
    await db.AdditionalFieldTemplate.create(aftOne);
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const editedLabel = 'edited';
    const response = await request(app)
      .put(`/additional-field-templates/${aftOne.id}`)
      .send({ ...aftOne, label: editedLabel })
      .set('x-access-token', token)
      .expect(200);

    const { data: editedAft } = response.body;
    expect(editedAft.label).toEqual(editedLabel);
    const aftInDb = await db.AdditionalFieldTemplate.findByPk(aftOne.id);
    expect(aftInDb).toBeDefined();
    expect(aftInDb.label).toEqual(editedLabel);
  });

  test('Should fail with validation errors', async () => {
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .put(`/additional-field-templates/${aftOne.id}`)
      .send({ ...aftOne, label: '' })
      .set('x-access-token', token)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with not found error', async () => {
    const aftOne = generateAft();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    const response = await request(app)
      .put(`/additional-field-templates/${v4()}`)
      .send(aftOne)
      .set('x-access-token', token)
      .expect(404);

    const { error } = response.body;
    expect(error).toBe(ERRORS.AFT_NOT_FOUND);
  });
});

describe('DELETE /additional-field-templates', () => {
  test('Should delete additional field template & delete all uaf', async () => {
    const userOne = createUser();
    const aftOne = generateAft();
    await db.AdditionalFieldTemplate.create(aftOne);
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');
    await db.UserAdditionalField
      .create({ user_id: userOne.id, additional_field_template_id: aftOne.id, value: false });

    const aftInDb = await db.AdditionalFieldTemplate.findByPk(aftOne.id);
    expect(aftInDb).toBeDefined();

    const uafInDb = await db.UserAdditionalField
      .findOne({ where: { additional_field_template_id: aftOne.id } });
    expect(uafInDb).toBeDefined();

    await request(app)
      .delete(`/additional-field-templates/${aftOne.id}`)
      .set('x-access-token', token)
      .expect(200);

    const aftInDbAfterDelete = await db.AdditionalFieldTemplate.findByPk(aftOne.id);
    expect(aftInDbAfterDelete).toBeNull();

    const uafInDbAfterDelete = await db.UserAdditionalField
      .findOne({ where: { additional_field_template_id: aftOne.id } });
    expect(uafInDbAfterDelete).toBeNull();
  });
});
