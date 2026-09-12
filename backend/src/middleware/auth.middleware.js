const { verifyAccessToken } = require('../utils/tokens');
const { error } = require('../utils/response');
const { User, Role } = require('../models');

// Verifies the access token, loads the user + role, and attaches req.user.
// Any route behind this middleware is guaranteed to have an authenticated,
// active user — this is the real security boundary (frontend hiding
// buttons is only for UX, per the official brief).
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return error(res, { message: 'Authentication token missing', status: 401, code: 'NO_TOKEN' });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return error(res, { message: 'Session expired or invalid token', status: 401, code: 'TOKEN_INVALID' });
    }

    const user = await User.findByPk(payload.sub, { include: [{ model: Role }] });

    if (!user || user.status !== 'active') {
      return error(res, { message: 'Account is not active', status: 401, code: 'ACCOUNT_INACTIVE' });
    }

    req.user = user;
    req.userPermissions = null; // populated lazily by authorize() middleware
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
