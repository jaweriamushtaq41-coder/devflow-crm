// Parses standard query params: ?page=1&limit=10&search=acme&status=active&sortBy=createdAt&sortOrder=desc
function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = (query.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return { page, limit, offset, sortBy, sortOrder };
}

module.exports = { parsePagination };
