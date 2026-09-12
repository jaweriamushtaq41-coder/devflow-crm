const router = require('express').Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.patch('/:taskId/status', authorize('tasks.assign', 'projects.manage'), projectController.updateTaskStatus);

module.exports = router;
