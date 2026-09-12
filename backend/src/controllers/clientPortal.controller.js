const { Client, Project, Requirement, Invoice, Ticket, Milestone, Task, User } = require('../models');
const { recordAudit } = require('../services/audit.service');
const { success, created, error } = require('../utils/response');

// Resolves the Client record tied to the currently authenticated portal user.
// CRITICAL SECURITY RULE (brief section 8.2): the backend derives the
// permitted client identity from the session — it never trusts a clientId
// sent from the browser.
async function resolveClientForUser(userId) {
  const client = await Client.findOne({ where: { portalUserId: userId } });
  if (!client) {
    const err = new Error('No client account is linked to this user');
    err.status = 403;
    throw err;
  }
  return client;
}

// GET /api/v1/portal/dashboard
async function getDashboard(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);

    const [projects, openTickets, pendingRequirements] = await Promise.all([
      Project.count({ where: { clientId: client.id } }),
      Ticket.count({ where: { clientId: client.id, status: ['open', 'in_progress', 'waiting_client'] } }),
      Requirement.count({
        include: [{ model: Project, where: { clientId: client.id }, attributes: [] }],
        where: { status: ['submitted', 'clarification'] },
      }),
    ]);

    return success(res, { data: { projects, openTickets, pendingRequirements } });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// GET /api/v1/portal/projects
async function getMyProjects(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const projects = await Project.findAll({
      where: { clientId: client.id },
      include: [{ model: User, as: 'projectManager', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return success(res, { data: projects });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// GET /api/v1/portal/projects/:id
async function getMyProjectDetails(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const project = await Project.findOne({
      where: { id: req.params.id, clientId: client.id }, // scoped — cannot view other clients' projects
      include: [{ model: Milestone }, { model: Task }, { model: Requirement }],
    });
    if (!project) return error(res, { message: 'Project not found', status: 404 });
    return success(res, { data: project });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// GET /api/v1/portal/invoices
async function getMyInvoices(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const invoices = await Invoice.findAll({ where: { clientId: client.id }, order: [['createdAt', 'DESC']] });
    return success(res, { data: invoices });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// POST /api/v1/portal/requirements
async function submitRequirement(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const project = await Project.findOne({ where: { id: req.body.projectId, clientId: client.id } });
    if (!project) return error(res, { message: 'Project not found for this client', status: 404 });

    const requirementService = require('../services/requirement.service');
    const requirement = await requirementService.createRequirement({
      projectId: project.id,
      title: req.body.title,
      body: req.body.body,
      priority: req.body.priority || 'medium',
      submittedBy: req.user.id,
    });

    await recordAudit({ actorId: req.user.id, action: 'requirement.create', entityType: 'Requirement', entityId: requirement.id });
    return created(res, { message: 'Requirement submitted', data: requirement });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/portal/tickets
async function createTicket(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const count = await Ticket.count();
    const ticket = await Ticket.create({
      code: `TCK-${1000 + count + 1}`,
      clientId: client.id,
      projectId: req.body.projectId || null,
      createdBy: req.user.id,
      subject: req.body.subject,
      description: req.body.description,
      priority: req.body.priority || 'medium',
    });

    await recordAudit({ actorId: req.user.id, action: 'ticket.create', entityType: 'Ticket', entityId: ticket.id });
    return created(res, { message: 'Support ticket created', data: ticket });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// GET /api/v1/portal/tickets
async function getMyTickets(req, res, next) {
  try {
    const client = await resolveClientForUser(req.user.id);
    const tickets = await Ticket.findAll({ where: { clientId: client.id }, order: [['createdAt', 'DESC']] });
    return success(res, { data: tickets });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

module.exports = {
  getDashboard,
  getMyProjects,
  getMyProjectDetails,
  getMyInvoices,
  submitRequirement,
  createTicket,
  getMyTickets,
};
