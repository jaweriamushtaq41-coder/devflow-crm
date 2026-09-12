const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Applied to sensitive auth endpoints (login, forgot-password) per the
// official brief's security requirements (section 5.3).
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    code: 'RATE_LIMITED',
  },
});

module.exports = { authLimiter };
