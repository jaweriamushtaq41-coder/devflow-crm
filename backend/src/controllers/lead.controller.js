const leadService = require('../services/lead.service');
const { recordAudit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');
const { success, created, error, paginationMeta } = require('../utils/response');

// POST /api/v1/leads
async function createLead(req, res, next) {
  try {
    const payload = { ...req.body, ownerId: req.body.ownerId || req.user.id };
    const lead = await leadService.createLead(payload);

    await recordAudit({ actorId: req.user.id, action: 'lead.create', entityType: 'Lead', entityId: lead.id });

    if (payload.ownerId && payload.ownerId !== req.user.id) {
      await notifyUser({
        userId: payload.ownerId,
        type: 'lead_assigned',
        title: `New lead assigned: ${lead.name}`,
        link: `/app/crm/leads/${lead.id}`,
      });
    }

    return created(res, { message: 'Lead created', data: lead });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/leads
async function getAllLeads(req, res, next) {
  try {
    const { rows, count, page, limit } = await leadService.getAllLeads(req.query);
    return success(res, { data: rows, meta: paginationMeta({ page, limit, total: count }) });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/leads/:id
async function getLead(req, res, next) {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (!lead) return error(res, { message: 'Lead not found', status: 404 });
    return success(res, { data: lead });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/leads/:id
async function updateLead(req, res, next) {
  try {
    const before = await leadService.getLeadById(req.params.id);
    if (!before) return error(res, { message: 'Lead not found', status: 404 });

    const lead = await leadService.updateLead(req.params.id, req.body);

    await recordAudit({
      actorId: req.user.id,
      action: 'lead.update',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: { before: { status: before.status }, after: { status: lead.status } },
    });

    return success(res, { message: 'Lead updated', data: lead });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/leads/:id/convert
async function convertLeadToClient(req, res, next) {
  try {
    const client = await leadService.convertLeadToClient(req.params.id, req.body);

    await recordAudit({
      actorId: req.user.id,
      action: 'lead.convert_to_client',
      entityType: 'Client',
      entityId: client.id,
      metadata: { leadId: req.params.id },
    });

    return success(res, { message: 'Lead converted to client successfully', data: client });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// GET /api/v1/deals/pipeline
async function getPipeline(req, res, next) {
  try {
    const pipeline = await leadService.getPipeline();
    return success(res, { data: pipeline });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  convertLeadToClient,
  getPipeline,
};
