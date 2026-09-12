// Consistent API response shape used across the whole backend.
// Success:  { success: true, message, data }
// List:     { success: true, data: [...], meta: { page, limit, total, totalPages } }
// Error:    { success: false, message, errors?, code? }

function success(res, { message = 'Success', data = null, status = 200, meta = null } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

function created(res, { message = 'Created', data = null } = {}) {
  return success(res, { message, data, status: 201 });
}

function error(res, { message = 'Something went wrong', status = 500, errors = null, code = null } = {}) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  if (code) payload.code = code;
  return res.status(status).json(payload);
}

function paginationMeta({ page, limit, total }) {
  return { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) || 0 };
}

module.exports = { success, created, error, paginationMeta };
