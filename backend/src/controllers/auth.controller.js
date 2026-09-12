const authService = require('../services/auth.service');
const { recordAudit } = require('../services/audit.service');
const { success, created, error } = require('../utils/response');

// POST /api/v1/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, roleName } = req.body;
    const user = await authService.registerUser({ name, email, password, roleName });

    await recordAudit({
      actorId: user.id,
      action: 'auth.register',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
    });

    return created(res, {
      message: 'Account created. Please check your email to verify your account.',
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status, code: err.code });
    next(err);
  }
}

// GET/POST /api/v1/auth/verify-email
async function verifyEmail(req, res, next) {
  try {
    const { email, token } = req.body;
    const user = await authService.verifyEmail({ email, token });

    await recordAudit({ actorId: user.id, action: 'auth.verify_email', entityType: 'User', entityId: user.id });

    return success(res, { message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status, code: err.code });
    next(err);
  }
}

// POST /api/v1/auth/resend-verification
async function resendVerification(req, res, next) {
  try {
    await authService.resendVerification({ email: req.body.email });
    // Generic response regardless of whether the email exists.
    return success(res, { message: 'If that email exists, a verification link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

    await recordAudit({ actorId: user.id, action: 'auth.login', entityType: 'User', entityId: user.id, ipAddress: req.ip });

    return success(res, {
      message: 'Login successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.Role ? user.Role.name : null },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status, code: err.code });
    next(err);
  }
}

// POST /api/v1/auth/refresh
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken({ refreshToken });
    return success(res, { message: 'Token refreshed', data: tokens });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status, code: err.code });
    next(err);
  }
}

// POST /api/v1/auth/logout
async function logout(req, res, next) {
  try {
    await authService.logoutUser({ userId: req.user.id });
    await recordAudit({ actorId: req.user.id, action: 'auth.logout', entityType: 'User', entityId: req.user.id });
    return success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword({ email: req.body.email });
    return success(res, { message: 'If that email exists, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body;
    await authService.resetPassword({ email, token, newPassword });
    return success(res, { message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status, code: err.code });
    next(err);
  }
}

// GET /api/v1/auth/me
async function me(req, res) {
  const user = req.user;
  return success(res, {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role ? user.Role.name : null,
      isEmailVerified: user.isEmailVerified,
    },
  });
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
};
