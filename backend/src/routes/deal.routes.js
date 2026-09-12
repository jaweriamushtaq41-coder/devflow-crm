const router = require('express').Router();
const leadController = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.get('/pipeline', authorize('deals.manage', 'leads.view'), leadController.getPipeline);

module.exports = router;
