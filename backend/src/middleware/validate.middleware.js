const { error } = require('../utils/response');

// Generic Zod-based request validator. Usage:
// router.post('/leads', validate(leadCreateSchema), controller)
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return error(res, {
        message: 'Validation failed',
        status: 400,
        errors,
        code: 'VALIDATION_ERROR',
      });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
