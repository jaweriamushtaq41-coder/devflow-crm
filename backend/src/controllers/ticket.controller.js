const ticketService = require('../services/ticket.service');
const { recordAudit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');
const { success, error } = require('../utils/response');

async function listTickets(req, res, next) {
  try {
    const tickets = await ticketService.listTickets(req.query);
    return success(res, { data: tickets });
  } catch (err) {
    next(err);
  }
}

async function getTicket(req, res, next) {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) return error(res, { message: 'Ticket not found', status: 404 });
    return success(res, { data: ticket });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status);
    await recordAudit({
      actorId: req.user.id,
      action: 'ticket.status_change',
      entityType: 'Ticket',
      entityId: ticket.id,
      metadata: { newStatus: req.body.status },
    });
    return success(res, { message: 'Ticket status updated', data: ticket });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    const ticket = await ticketService.assignTicket(req.params.id, req.body.assignedTo);
    await recordAudit({
      actorId: req.user.id,
      action: 'ticket.assign',
      entityType: 'Ticket',
      entityId: ticket.id,
      metadata: { assignedTo: req.body.assignedTo },
    });
    await notifyUser({
      userId: req.body.assignedTo,
      type: 'ticket_assigned',
      title: `Ticket assigned: ${ticket.subject}`,
      link: `/app/tickets`,
    });
    return success(res, { message: 'Ticket assigned', data: ticket });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

module.exports = { listTickets, getTicket, updateStatus, assign };
