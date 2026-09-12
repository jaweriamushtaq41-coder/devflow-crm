const { Notification } = require('../models');

async function notifyUser({ userId, type, title, body = null, link = null }) {
  if (!userId) return null;
  return Notification.create({ userId, type, title, body, link });
}

module.exports = { notifyUser };
