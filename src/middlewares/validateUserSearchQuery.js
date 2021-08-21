const { checkSchema } = require('express-validator');

const { availableOrder, availableSortByNames } = require('../database/constants');
const { ERRORS } = require('../translations');

module.exports = checkSchema({
  limit: {
    in: ['query'],
    isNumeric: true,
    custom: {
      errorMessage: ERRORS.LIMIT_QUERY_ERROR,
      options: (value) => value >= 1 && value <= 50,
    },
    optional: { options: { nullable: true } },
  },
  skip: {
    in: ['query'],
    isNumeric: true,
    errorMessage: ERRORS.SKIP_QUERY_ERROR,
    optional: { options: { nullable: true } },
  },
  order: {
    in: ['query'],
    isIn: {
      options: [availableOrder],
      errorMessage: ERRORS.ORDER_QUERY_ERROR,
    },
    isString: true,
    optional: { options: { nullable: true } },
  },
  sortBy: {
    in: ['query'],
    isIn: {
      options: [availableSortByNames],
      errorMessage: ERRORS.SORT_BY_QUERY_ERROR,
    },
    isString: true,
    optional: { options: { nullable: true } },
  },
  search: {
    in: ['query'],
    isString: true,
    isLength: {
      errorMessage: ERRORS.SEARCH_QUERY_ERROR,
      options: { min: 1, max: 30 },
    },
    optional: { options: { nullable: true } },
  },
});
