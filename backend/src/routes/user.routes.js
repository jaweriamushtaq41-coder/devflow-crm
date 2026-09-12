const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.get('/', authorize('users.view'), userController.listUsers);
router.post('/', authorize('users.create'), userController.createUser);
router.patch('/:id', authorize('users.update'), userController.updateUser);

module.exports = router;
