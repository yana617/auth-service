import jwt from 'jsonwebtoken';

export default (user) => jwt.sign(
  { id: user.id, role_id: user.role_id },
  process.env.TOKEN_KEY,
  { expiresIn: '2d' },
);
