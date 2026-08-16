const { errorResponse } = require('../utils/response.util');

/**
 * Validates request data against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with sanitized/coerced values
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, 'Validation failed', 422, formattedErrors);
      }
      return errorResponse(res, err.message || 'Invalid request payload', 400);
    }
  };
};

module.exports = {
  validate,
};
