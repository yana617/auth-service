import { checkSchema } from 'express-validator';

import {
  name,
  surname,
  phone,
  email,
  birthday,
  password,
} from '#utils/validationOptions';
import { ERRORS } from '#translations';

export default checkSchema({
  name,
  surname,
  phone,
  email,
  birthday,
  password,
  additionalFields: {
    exists: true,
    isArray: true,
    errorMessage: ERRORS.UAF_FIELD_ERROR,
  },
  'additionalFields.*.additionalFieldTemplateId': {
    exists: true,
  },
  'additionalFields.*.value': {
    exists: true,
    isBoolean: true,
  },
});
