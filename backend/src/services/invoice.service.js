const { Invoice, Client, Company, Project } = require('../models');

async function generateInvoiceNumber() {
  const count = await Invoice.count();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
}

async function listInvoices(query) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.clientId) where.clientId = query.clientId;

  return Invoice.findAll({
    where,
    include: [
      { model: Client, include: [{ model: Company, attributes: ['id', 'name'] }] },
      { model: Project, attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function createInvoice({ clientId, projectId, amount, dueDate, notes }) {
  const number = await generateInvoiceNumber();
  return Invoice.create({ number, clientId, projectId, amount, dueDate, notes, status: 'draft' });
}

async function updateInvoiceStatus(id, status) {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }
  invoice.status = status;
  await invoice.save();
  return invoice;
}

module.exports = { listInvoices, createInvoice, updateInvoiceStatus };
