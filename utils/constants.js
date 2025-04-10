const STATUS_TYPES = {
  OK: 200,
  CREATED: 201,
  DUPLICATE_KEY: 605,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
  NOT_FOUND: 404,
};
const generatedOtps = {};
module.exports = { STATUS_TYPES, generatedOtps };
