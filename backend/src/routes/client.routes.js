const router = require('express').Router();
const clientController = require('../controllers/client.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

// Any internal role that can create projects, invoices, or view leads needs
// this list for dropdowns — kept permissive since it's just names, not sensitive data.
router.get('/', authorize('leads.view', 'projects.view', 'projects.manage', 'invoices.manage', 'invoices.view'), clientController.listClients);

module.exports = router;
