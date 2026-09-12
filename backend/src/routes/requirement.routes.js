const router = require('express').Router();
const requirementController = require('../controllers/requirement.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', authorize('requirements.view', 'requirements.manage'), requirementController.listRequirements);
router.post('/', authorize('requirements.manage', 'requirements.view'), requirementController.createRequirement);
router.get('/:id', authorize('requirements.view', 'requirements.manage'), requirementController.getRequirement);
router.post('/:id/versions', authorize('requirements.manage', 'requirements.view'), requirementController.addVersion);
router.patch('/:id/implemented', authorize('requirements.manage'), requirementController.markImplemented);
router.post('/versions/:versionId/approve', authorize('requirements.approve'), requirementController.decideOnVersion);

module.exports = router;
