import { checkSchema } from 'express-validator';

import { ERRORS } from '#translations';
import { password, userId } from '#utils/validationOptions';

export default checkSchema({
  token: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.INVALID_TOKEN,
      options: { min: 10, max: 200 },
    },
    exists: true,
  },
  userId,
  password,
});
