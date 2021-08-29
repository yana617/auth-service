exports.name = {
  in: ['body'],
  isLength: {
    errorMessage: 'Name should be from 2 to 30 characters',
    options: { min: 2, max: 30 },
  },
  exists: true,
};

exports.password = {
  in: ['body'],
  isString: true,
  isLength: {
    errorMessage: 'Password should be at least 6 chars long',
    options: { min: 6 },
  },
  exists: true,
};

exports.surname = {
  in: ['body'],
  isString: true,
  isLength: {
    errorMessage: 'Surname should be from 2 to 30 characters',
    options: { min: 2, max: 30 },
  },
  exists: true,
};

exports.phone = {
  in: ['body'],
  isLength: {
    errorMessage: 'Phone should be 12 characters',
    options: { min: 12, max: 12 },
  },
  exists: true,
};

exports.email = {
  in: ['body'],
  isEmail: {
    bail: true,
  },
  exists: true,
};
