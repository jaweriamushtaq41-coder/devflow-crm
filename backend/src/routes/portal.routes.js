const router = require('express').Router();
const portalController = require('../controllers/clientPortal.controller');
const { authenticate } = require('../middleware/auth.middleware');

// The Client Portal has its own scoping logic inside the controller
// (resolveClientForUser) rather than permission-key based RBAC, since
// every route here is implicitly "own data only" for the Client role.
router.use(authenticate);

router.get('/dashboard', portalController.getDashboard);
router.get('/projects', portalController.getMyProjects);
router.get('/projects/:id', portalController.getMyProjectDetails);
router.get('/invoices', portalController.getMyInvoices);
router.post('/requirements', portalController.submitRequirement);
router.get('/tickets', portalController.getMyTickets);
router.post('/tickets', portalController.createTicket);

module.exports = router;
