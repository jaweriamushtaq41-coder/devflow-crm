const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} = require('../utils/tokens');
const { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate } = require('../utils/email');
const env = require('../config/env');

const SALT_ROUNDS = 12;
const VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1h

async function registerUser({ name, email, password, roleName = 'Client' }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    err.code = 'EMAIL_TAKEN';
    throw err;
  }

  const role = await Role.findOne({ where: { name: roleName } });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = generateRandomToken();

  const user = await User.create({
    name,
    email,
    passwordHash,
    roleId: role ? role.id : null,
    status: 'pending_verification',
    isEmailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + VERIFY_EXPIRY_MS),
  });

  const verifyUrl = `${env.clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Verify your DevFlow CRM account',
    html: verificationEmailTemplate({ name, verifyUrl }),
  });

  return user;
}

async function verifyEmail({ email, token }) {
  const user = await User.scope('withSecrets').findOne({ where: { email } });
  if (!user || !user.emailVerificationToken) {
    const err = new Error('Invalid or expired verification link');
    err.status = 400;
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const isExpired = !user.emailVerificationExpires || user.emailVerificationExpires < new Date();
  const isMatch = user.emailVerificationToken === hashToken(token);

  if (isExpired || !isMatch) {
    const err = new Error('Invalid or expired verification link');
    err.status = 400;
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  user.isEmailVerified = true;
  user.status = 'active';
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return user;
}

async function resendVerification({ email }) {
  const user = await User.scope('withSecrets').findOne({ where: { email } });
  // Do not reveal whether the email exists — generic success response either way.
  if (!user || user.isEmailVerified) return;

  const verificationToken = generateRandomToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + VERIFY_EXPIRY_MS);
  await user.save();

  const verifyUrl = `${env.clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Verify your DevFlow CRM account',
    html: verificationEmailTemplate({ name: user.name, verifyUrl }),
  });
}

async function loginUser({ email, password }) {
  const user = await User.scope('withSecrets').findOne({ where: { email }, include: [Role] });

  // Generic authentication message — never reveal whether the email exists (section 18.1 test scenario).
  const genericError = () => {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    return err;
  };

  if (!user) throw genericError();

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw genericError();

  if (!user.isEmailVerified) {
    const err = new Error('Please verify your email before logging in');
    err.status = 403;
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  if (user.status !== 'active') {
    const err = new Error('Your account is not active. Contact an administrator.');
    err.status = 403;
    err.code = 'ACCOUNT_INACTIVE';
    throw err;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  const safeUser = await User.findByPk(user.id, { include: [Role] });

  return { user: safeUser, accessToken, refreshToken };
}

async function refreshAccessToken({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    const e = new Error('Session expired, please log in again');
    e.status = 401;
    e.code = 'REFRESH_INVALID';
    throw e;
  }

  const user = await User.scope('withSecrets').findByPk(payload.sub, { include: [Role] });

  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    const e = new Error('Session expired, please log in again');
    e.status = 401;
    e.code = 'REFRESH_INVALID';
    throw e;
  }

  // Rotate refresh token on every use (recommended in section 5.2).
  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logoutUser({ userId }) {
  await User.update({ refreshTokenHash: null }, { where: { id: userId } });
}

async function forgotPassword({ email }) {
  const user = await User.scope('withSecrets').findOne({ where: { email } });
  if (!user) return; // do not reveal existence

  const resetToken = generateRandomToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_EXPIRY_MS);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Reset your DevFlow CRM password',
    html: resetPasswordEmailTemplate({ name: user.name, resetUrl }),
  });
}

async function resetPassword({ email, token, newPassword }) {
  const user = await User.scope('withSecrets').findOne({
    where: { email, passwordResetExpires: { [Op.gt]: new Date() } },
  });

  if (!user || !user.passwordResetToken || user.passwordResetToken !== hashToken(token)) {
    const err = new Error('Invalid or expired reset link');
    err.status = 400;
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshTokenHash = null; // force re-login everywhere
  await user.save();
}

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
};
