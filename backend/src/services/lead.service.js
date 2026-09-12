const { Op } = require('sequelize');
const { sequelize, Lead, Deal, Company, Client, Contact, User } = require('../models');
const { parsePagination } = require('../utils/pagination');

async function createLead(payload) {
  return Lead.create(payload);
}

async function getAllLeads(query) {
  const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);
  const where = {};

  if (query.status) where.status = query.status;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.source) where.source = query.source;
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } },
    ];
  }

  const { rows, count } = await Lead.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      { model: Company, attributes: ['id', 'name'] },
      { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
    ],
  });

  return { rows, count, page, limit };
}

async function getLeadById(id) {
  return Lead.findByPk(id, {
    include: [
      { model: Company },
      { model: Contact },
      { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      { model: Deal },
    ],
  });
}

async function updateLead(id, payload) {
  const lead = await Lead.findByPk(id);
  if (!lead) return null;
  await lead.update(payload);
  return lead;
}

// Converts a Won lead into a Client record (and optionally a portal user).
// This is the CRM -> Delivery bridge described in the brief's conversion flow:
// Lead -> Qualification -> Prospect -> Deal -> Won -> Client record.
async function convertLeadToClient(id, { accountManagerId } = {}) {
  return sequelize.transaction(async (t) => {
    const lead = await Lead.findByPk(id, { transaction: t });
    if (!lead) {
      const err = new Error('Lead not found');
      err.status = 404;
      throw err;
    }

    let company = lead.companyId ? await Company.findByPk(lead.companyId, { transaction: t }) : null;
    if (!company) {
      company = await Company.create({ name: lead.name, ownerId: lead.ownerId }, { transaction: t });
    }

    const existingClient = await Client.findOne({ where: { companyId: company.id }, transaction: t });
    if (existingClient) {
      const err = new Error('This company is already a client');
      err.status = 409;
      throw err;
    }

    const client = await Client.create(
      { companyId: company.id, accountManagerId: accountManagerId || lead.ownerId, status: 'active' },
      { transaction: t }
    );

    lead.status = 'won';
    lead.isArchived = true;
    await lead.save({ transaction: t });

    return client;
  });
}

// Returns deals grouped by pipeline stage for the Kanban board.
async function getPipeline() {
  const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const deals = await Deal.findAll({
    include: [
      { model: Company, attributes: ['id', 'name'] },
      { model: User, as: 'owner', attributes: ['id', 'name'] },
    ],
    order: [['updatedAt', 'DESC']],
  });

  const grouped = Object.fromEntries(stages.map((s) => [s, []]));
  deals.forEach((deal) => {
    if (grouped[deal.stage]) grouped[deal.stage].push(deal);
  });

  return grouped;
}

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  convertLeadToClient,
  getPipeline,
};
