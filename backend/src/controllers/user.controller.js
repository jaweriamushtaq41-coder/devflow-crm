const bcrypt = require('bcryptjs');
const { User, Role, Permission } = require('../models');
const { recordAudit } = require('../services/audit.service');
const { success, created, error } = require('../utils/response');

// GET /api/v1/users
async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({ include: [Role], order: [['createdAt', 'DESC']] });
    return success(res, { data: users });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/users (admin creates an internal user directly, pre-verified)
async function createUser(req, res, next) {
  try {
    const { name, email, password, roleId } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, { message: 'Email already in use', status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      roleId,
      status: 'active',
      isEmailVerified: true,
    });

    await recordAudit({ actorId: req.user.id, action: 'user.create', entityType: 'User', entityId: user.id });
    return created(res, { message: 'User created', data: user });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/users/:id
async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, { message: 'User not found', status: 404 });

    const { name, roleId, status } = req.body;
    await user.update({ name, roleId, status });

    await recordAudit({
      actorId: req.user.id,
      action: 'user.update',
      entityType: 'User',
      entityId: user.id,
      metadata: { roleId, status },
    });

    return success(res, { message: 'User updated', data: user });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/roles
async function listRoles(req, res, next) {
  try {
    const roles = await Role.findAll({ include: [Permission] });
    return success(res, { data: roles });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/permissions
async function listPermissions(req, res, next) {
  try {
    const permissions = await Permission.findAll();
    return success(res, { data: permissions });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser, updateUser, listRoles, listPermissions };
