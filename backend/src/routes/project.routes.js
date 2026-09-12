const router = require('express').Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', authorize('projects.view', 'projects.manage'), projectController.listProjects);
router.post('/', authorize('projects.manage'), projectController.createProject);
router.get('/my-work', authorize('tasks.assign', 'projects.view'), projectController.getMyWork);
router.get('/:id', authorize('projects.view', 'projects.manage'), projectController.getProject);
router.patch('/:id/status', authorize('projects.manage'), projectController.updateStatus);
router.post('/:id/milestones', authorize('projects.manage'), projectController.createMilestone);
router.post('/:id/tasks', authorize('tasks.assign', 'projects.manage'), projectController.createTask);
router.get('/:id/board', authorize('projects.view', 'projects.manage'), projectController.getTaskBoard);

module.exports = router;
