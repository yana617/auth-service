const request = require('supertest');

const app = require('../../app');
const db = require('../database');
const {
  generateUser,
  generateGuest,
  createUser,
  createUserAndGetToken,
} = require('./fixtures/db');
const { ERRORS } = require('../translations');

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  await db.Guest.destroy({ where: {} });
});

describe('(get) POST /users', () => {
  test('Should return users short because not authorized', async () => {
    const userOne = await createUser(generateUser());
    const userTwo = await createUser(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .post('/internal/users')
      .send({ ids: [userOne.id, userTwo.id] })
      .expect(200);

    const { data: users } = response.body;
    expect(users).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].phone).not.toBeDefined();
    expect(users[0].email).not.toBeDefined();
    expect(users[1].phone).not.toBeDefined();
    expect(users[1].email).not.toBeDefined();
  });

  test('Should return users short because do not have permissions to create claim', async () => {
    const userOne = await createUser(generateUser());
    const userTwo = await createUser(generateUser(), 'VOLUNTEER');
    const token = await createUserAndGetToken(generateUser(), 'USER');

    const response = await request(app)
      .post('/internal/users')
      .set('x-access-token', token)
      .send({ ids: [userOne.id, userTwo.id] })
      .expect(200);

    const { data: users } = response.body;
    expect(users).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].name).toBeDefined();
    expect(users[0].surname).toBeDefined();
    expect(users[0].phone).not.toBeDefined();
    expect(users[0].email).not.toBeDefined();
    expect(users[1].phone).not.toBeDefined();
    expect(users[1].email).not.toBeDefined();
  });

  test('Should return users full because you have permissions to create claim', async () => {
    const userOne = await createUser(generateUser());
    const userTwo = await createUser(generateUser(), 'VOLUNTEER');
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .post('/internal/users')
      .set('x-access-token', token)
      .send({ ids: [userOne.id, userTwo.id] })
      .expect(200);

    const { data: users } = response.body;
    expect(users).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].phone).toBeDefined();
    expect(users[0].email).toBeDefined();
    expect(users[1].phone).toBeDefined();
    expect(users[1].email).toBeDefined();
  });
});

describe('(get) POST /guests', () => {
  test('Should return guests short because not authorized', async () => {
    const guestOne = generateGuest();
    await db.Guest.create(guestOne);

    const response = await request(app)
      .post('/internal/guests')
      .send({ ids: [guestOne.id] })
      .expect(200);

    const { data: guests } = response.body;
    expect(guests).toBeDefined();
    expect(guests.length).toBe(1);
    expect(guests[0].name).toBeDefined();
    expect(guests[0].surname).toBeDefined();
    expect(guests[0].phone).not.toBeDefined();
  });

  test('Should return guests short because do not have permissions to create claim', async () => {
    const guestOne = generateGuest();
    const guestTwo = generateGuest();
    await db.Guest.create(guestOne);
    await db.Guest.create(guestTwo);
    const token = await createUserAndGetToken(generateUser(), 'USER');

    const response = await request(app)
      .post('/internal/guests')
      .set('x-access-token', token)
      .send({ ids: [guestOne.id, guestTwo.id] })
      .expect(200);

    const { data: guests } = response.body;
    expect(guests).toBeDefined();
    expect(guests.length).toBe(2);
    expect(guests[0].name).toBeDefined();
    expect(guests[0].surname).toBeDefined();
    expect(guests[0].phone).not.toBeDefined();
    expect(guests[1].phone).not.toBeDefined();
  });

  test('Should return guests full because you have permissions to create claim', async () => {
    const guestOne = generateGuest();
    const guestTwo = generateGuest();
    await db.Guest.create(guestOne);
    await db.Guest.create(guestTwo);
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .post('/internal/guests')
      .send({ ids: [guestOne.id, guestTwo.id] })
      .set('x-access-token', token)
      .expect(200);

    const { data: guests } = response.body;
    expect(guests).toBeDefined();
    expect(guests.length).toBe(2);
    expect(guests[0].name).toBeDefined();
    expect(guests[0].surname).toBeDefined();
    expect(guests[0].phone).toBeDefined();
    expect(guests[1].phone).toBeDefined();
  });
});

describe('(get) POST /guest', () => {
  test('Should fail with no auth', async () => {
    const response = await request(app)
      .post('/internal/guest')
      .send({ phone: 'invalid' })
      .expect(401);

    const { error } = response.body;
    expect(error).toBe(ERRORS.INVALID_TOKEN);
  });

  test('Should fail with no permission', async () => {
    const token = await createUserAndGetToken(generateUser(), 'VOLUNTEER');

    const response = await request(app)
      .post('/internal/guest')
      .set('x-access-token', token)
      .send({ phone: 'invalid' })
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.FORBIDDEN);
  });

  test('Should fail with validation errors', async () => {
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .post('/internal/guest')
      .set('x-access-token', token)
      .send({})
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should return existing guest', async () => {
    const guestOne = generateGuest();
    await db.Guest.create(guestOne);
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .post('/internal/guest')
      .set('x-access-token', token)
      .send(guestOne)
      .expect(200);

    const { data: guest } = response.body;
    expect(guest.name).toBe(guestOne.name);

    const guestInDb = await db.Guest.findOne({ where: { phone: guestOne.phone } });
    expect(guestInDb).toBeDefined();
    expect(guestInDb.phone).toBe(guestOne.phone);
  });

  test('Should create new guest', async () => {
    const guestOne = generateGuest();
    const token = await createUserAndGetToken(generateUser(), 'ADMIN');

    const response = await request(app)
      .post('/internal/guest')
      .set('x-access-token', token)
      .send(guestOne)
      .expect(200);

    const { data: guest } = response.body;
    expect(guest.name).toBe(guestOne.name);
    expect(guest.phone).toBe(guestOne.phone);

    const guestInDb = await db.Guest.findOne({ where: { phone: guestOne.phone } });
    expect(guestInDb).toBeDefined();
    expect(guestInDb.phone).toBe(guestOne.phone);
  });
});

describe('GET /auth', () => {
  test('Should fail with no auth', async () => {
    const response = await request(app)
      .get('/internal/auth')
      .expect(401);

    const { error } = response.body;
    expect(error).toBe(ERRORS.INVALID_TOKEN);
  });

  test('Should return success', async () => {
    const token = await createUserAndGetToken(generateUser(), 'USER');

    const response = await request(app)
      .get('/internal/auth')
      .set('x-access-token', token)
      .expect(200);

    const { success } = response.body;
    expect(success).toBeTruthy();
  });
});
