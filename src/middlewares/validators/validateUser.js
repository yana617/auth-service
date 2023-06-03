import { checkSchema } from 'express-validator';

import {
  name,
  surname,
  phone,
  email,
  birthday,
} from '#utils/validationOptions';

export default checkSchema({
  name,
  surname,
  phone,
  email,
  birthday,
});
