import { checkSchema } from 'express-validator';

import { name, surname, phone } from '#utils/validationOptions';

export default checkSchema({
  name,
  surname,
  phone,
});
