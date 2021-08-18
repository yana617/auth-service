exports.email = {
  in: ['body'],
  isEmail: {
    bail: true,
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
