const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/roles', require('./role.routes'));
router.use('/permissions', require('./permission.routes'));
router.use('/leads', require('./lead.routes'));
router.use('/deals', require('./deal.routes'));
router.use('/clients', require('./client.routes'));
router.use('/projects', require('./project.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/requirements', require('./requirement.routes'));
router.use('/tickets', require('./ticket.routes'));
router.use('/invoices', require('./invoice.routes'));
router.use('/portal', require('./portal.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/audit-logs', require('./auditLog.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;
