const router = require('express').Router();
const leadController = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', authorize('leads.view'), leadController.getAllLeads);
router.post('/', authorize('leads.create'), leadController.createLead);
router.get('/:id', authorize('leads.view'), leadController.getLead);
router.patch('/:id', authorize('leads.update'), leadController.updateLead);
router.post('/:id/convert', authorize('leads.update', 'deals.manage'), leadController.convertLeadToClient);

module.exports = router;
