const { Notification } = require('../models');
const { success } = require('../utils/response');

// GET /api/v1/notifications
async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });
    const unreadCount = await Notification.count({ where: { userId: req.user.id, readAt: null } });
    return success(res, { data: notifications, meta: { unreadCount } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/notifications/:id/read
async function markRead(req, res, next) {
  try {
    await Notification.update({ readAt: new Date() }, { where: { id: req.params.id, userId: req.user.id } });
    return success(res, { message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, readAt: null } });
    return success(res, { message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
