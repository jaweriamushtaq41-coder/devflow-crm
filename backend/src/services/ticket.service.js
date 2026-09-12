const { Ticket, Client, Company, Project, User } = require('../models');

async function listTickets(query) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;

  return Ticket.findAll({
    where,
    include: [
      { model: Client, include: [{ model: Company, attributes: ['id', 'name'] }] },
      { model: Project, attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function getTicketById(id) {
  return Ticket.findByPk(id, {
    include: [
      { model: Client, include: [{ model: Company, attributes: ['id', 'name'] }] },
      { model: Project, attributes: ['id', 'name'] },
    ],
  });
}

async function updateTicketStatus(id, status) {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  }
  ticket.status = status;
  await ticket.save();
  return ticket;
}

async function assignTicket(id, assignedTo) {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  }
  ticket.assignedTo = assignedTo;
  if (ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();
  return ticket;
}

module.exports = { listTickets, getTicketById, updateTicketStatus, assignTicket };
