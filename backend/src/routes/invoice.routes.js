const router = require('express').Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', authorize('invoices.view', 'invoices.manage'), invoiceController.listInvoices);
router.post('/', authorize('invoices.manage'), invoiceController.createInvoice);
router.patch('/:id/status', authorize('invoices.manage'), invoiceController.updateStatus);

module.exports = router;
