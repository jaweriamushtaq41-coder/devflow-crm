const { error } = require('../utils/response');
const { Role, Permission } = require('../models');

// Reusable RBAC middleware. Usage: router.get('/leads', authenticate, authorize('leads.view'), controller)
// Looks up the permissions attached to the current user's role and checks
// the required permission key(s) against that set. At least one match is
// required when multiple permissions are passed (OR semantics).
function authorize(...requiredPermissions) {
  return async function authorizeMiddleware(req, res, next) {
    try {
      if (!req.user) {
        return error(res, { message: 'Not authenticated', status: 401 });
      }

      // Super Admin bypass — full system control per role matrix (section 4).
      if (req.user.Role && req.user.Role.name === 'Super Admin') {
        return next();
      }

      if (!req.user.roleId) {
        return error(res, { message: 'No role assigned to this account', status: 403, code: 'NO_ROLE' });
      }

      const role = await Role.findByPk(req.user.roleId, { include: [Permission] });
      const grantedKeys = new Set((role?.Permissions || []).map((p) => p.key));

      const isAllowed = requiredPermissions.some((perm) => grantedKeys.has(perm));

      if (!isAllowed) {
        return error(res, {
          message: 'You do not have permission to perform this action',
          status: 403,
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authorize };
