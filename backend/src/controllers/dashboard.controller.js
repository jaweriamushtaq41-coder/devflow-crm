const { Op } = require('sequelize');
const {
  Lead,
  Deal,
  Project,
  Task,
  Invoice,
  Ticket,
  AuditLog,
  User,
} = require('../models');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

// GET /api/v1/dashboard/summary
// Returns role-scoped KPI data. Internal roles get org-wide numbers;
// the client portal has its own dedicated dashboard controller.
async function getSummary(req, res, next) {
  try {
    const roleName = req.user.Role ? req.user.Role.name : null;
    const isDeliveryFocused = ['Project Manager', 'Developer / Team Member', 'Developer'].includes(roleName);
    const isSalesFocused = ['Sales / Business Developer', 'Sales'].includes(roleName);

    const today = new Date();

    const [totalLeads, activeProjects, tasksDueToday, overdueTasks, openTickets] = await Promise.all([
      Lead.count({ where: { isArchived: false } }),
      Project.count({ where: { status: ['planning', 'active', 'in_review', 'uat'] } }),
      Task.count({ where: { dueDate: today.toISOString().slice(0, 10), status: { [Op.ne]: 'done' } } }),
      Task.count({ where: { dueDate: { [Op.lt]: today.toISOString().slice(0, 10) }, status: { [Op.ne]: 'done' } } }),
      Ticket.count({ where: { status: ['open', 'in_progress', 'waiting_client'] } }),
    ]);

    let pipelineValue = 0;
    if (!isDeliveryFocused) {
      const deals = await Deal.findAll({ attributes: ['value', 'stage'] });
      pipelineValue = deals
        .filter((d) => !['won', 'lost'].includes(d.stage))
        .reduce((sum, d) => sum + Number(d.value || 0), 0);
    }

    let revenueSummary = null;
    if (!isDeliveryFocused && !isSalesFocused) {
      const invoices = await Invoice.findAll({ attributes: ['amount', 'status'] });
      revenueSummary = {
        billed: invoices.reduce((s, i) => s + Number(i.amount || 0), 0),
        outstanding: invoices
          .filter((i) => ['issued', 'sent', 'partially_paid', 'overdue'].includes(i.status))
          .reduce((s, i) => s + Number(i.amount || 0), 0),
      };
    }

    return success(res, {
      data: {
        totalLeads,
        pipelineValue,
        activeProjects,
        tasksDueToday,
        overdueTasks,
        openTickets,
        revenueSummary,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/audit-logs (requires audit.view permission)
async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(req.query);
    const where = {};
    if (req.query.entityType) where.entityType = req.query.entityType;
    if (req.query.action) where.action = req.query.action;

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy === 'createdAt' ? 'createdAt' : sortBy, sortOrder]],
      include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }],
    });

    const { paginationMeta } = require('../utils/response');
    return success(res, { data: rows, meta: paginationMeta({ page, limit, total: count }) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getAuditLogs };
