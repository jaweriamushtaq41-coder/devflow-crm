const invoiceService = require('../services/invoice.service');
const { recordAudit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');
const { success, created, error } = require('../utils/response');
const { Client } = require('../models');

async function listInvoices(req, res, next) {
  try {
    const invoices = await invoiceService.listInvoices(req.query);
    return success(res, { data: invoices });
  } catch (err) {
    next(err);
  }
}

async function createInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    await recordAudit({ actorId: req.user.id, action: 'invoice.create', entityType: 'Invoice', entityId: invoice.id });

    const client = await Client.findByPk(invoice.clientId);
    if (client?.portalUserId) {
      await notifyUser({
        userId: client.portalUserId,
        type: 'invoice_issued',
        title: `New invoice: ${invoice.number}`,
        link: '/portal/invoices',
      });
    }

    return created(res, { message: 'Invoice created', data: invoice });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(req.params.id, req.body.status);
    await recordAudit({
      actorId: req.user.id,
      action: 'invoice.status_change',
      entityType: 'Invoice',
      entityId: invoice.id,
      metadata: { newStatus: req.body.status },
    });
    return success(res, { message: 'Invoice status updated', data: invoice });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

module.exports = { listInvoices, createInvoice, updateStatus };
