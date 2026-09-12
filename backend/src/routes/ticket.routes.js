const router = require('express').Router();
const ticketController = require('../controllers/ticket.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', authorize('tickets.view', 'tickets.manage'), ticketController.listTickets);
router.get('/:id', authorize('tickets.view', 'tickets.manage'), ticketController.getTicket);
router.patch('/:id/status', authorize('tickets.manage'), ticketController.updateStatus);
router.patch('/:id/assign', authorize('tickets.manage'), ticketController.assign);

module.exports = router;
