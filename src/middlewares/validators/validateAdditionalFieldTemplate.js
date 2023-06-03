import { checkSchema } from 'express-validator';

import { ERRORS } from '#translations';

export default checkSchema({
  label: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.AFT_LABEL_ERROR,
      options: { min: 2, max: 30 },
    },
    exists: true,
  },
  description: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.AFT_DESCRIPTION_ERROR,
      options: { min: 50, max: 150 },
    },
    exists: true,
  },
  icon: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.AFT_ICON_ERROR,
      options: { min: 10, max: 150 },
    },
    optional: { options: { nullable: true } },
  },
});
