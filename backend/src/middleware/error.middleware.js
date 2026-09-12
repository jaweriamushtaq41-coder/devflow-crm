const { error } = require('../utils/response');

// Centralized error handler — must be the LAST middleware registered in app.js.
// Never leak stack traces or internal details in production responses.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return error(res, {
      message: 'A record with this value already exists',
      status: 409,
      code: 'DUPLICATE_ENTRY',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return error(res, {
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return error(res, {
      message: 'Related record not found or cannot be modified due to dependencies',
      status: 409,
      code: 'FK_CONSTRAINT',
    });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  return error(res, { message, status, code: err.code || 'SERVER_ERROR' });
}

function notFoundHandler(req, res) {
  return error(res, { message: `Route not found: ${req.method} ${req.originalUrl}`, status: 404, code: 'NOT_FOUND' });
}

module.exports = { errorHandler, notFoundHandler };
