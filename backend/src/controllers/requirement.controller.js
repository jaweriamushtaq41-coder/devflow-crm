const requirementService = require('../services/requirement.service');
const { recordAudit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');
const { success, created, error } = require('../utils/response');
const { Project } = require('../models');

// POST /api/v1/requirements
async function createRequirement(req, res, next) {
  try {
    const { projectId, title, body, priority } = req.body;
    const requirement = await requirementService.createRequirement({
      projectId,
      title,
      body,
      priority,
      submittedBy: req.user.id,
    });

    await recordAudit({
      actorId: req.user.id,
      action: 'requirement.create',
      entityType: 'Requirement',
      entityId: requirement.id,
    });

    const project = await Project.findByPk(projectId);
    if (project?.pmId) {
      await notifyUser({
        userId: project.pmId,
        type: 'requirement_submitted',
        title: `New requirement submitted: ${requirement.code}`,
        link: `/app/requirements/${requirement.id}`,
      });
    }

    return created(res, { message: 'Requirement created', data: requirement });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/requirements
async function listRequirements(req, res, next) {
  try {
    const requirements = await requirementService.listRequirements(req.query);
    return success(res, { data: requirements });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/requirements/:id
async function getRequirement(req, res, next) {
  try {
    const requirement = await requirementService.getRequirementById(req.params.id);
    if (!requirement) return error(res, { message: 'Requirement not found', status: 404 });
    return success(res, { data: requirement });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/requirements/:id/versions
async function addVersion(req, res, next) {
  try {
    const { body, changeSummary } = req.body;
    const version = await requirementService.addVersion(req.params.id, {
      body,
      changeSummary,
      createdBy: req.user.id,
    });

    await recordAudit({
      actorId: req.user.id,
      action: 'requirement.new_version',
      entityType: 'Requirement',
      entityId: req.params.id,
      metadata: { versionNo: version.versionNo },
    });

    return created(res, { message: `Version ${version.versionNo} created`, data: version });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// POST /api/v1/requirements/versions/:versionId/approve
// body: { decision: 'approved' | 'rejected' | 'clarification_requested', note }
async function decideOnVersion(req, res, next) {
  try {
    const { decision, note } = req.body;
    const { approval, requirement } = await requirementService.decideOnVersion(req.params.versionId, {
      approverId: req.user.id,
      decision,
      note,
    });

    await recordAudit({
      actorId: req.user.id,
      action: `requirement.${decision}`,
      entityType: 'Requirement',
      entityId: requirement.id,
      metadata: { versionId: req.params.versionId, note },
    });

    await notifyUser({
      userId: requirement.submittedBy,
      type: 'requirement_decision',
      title: `Requirement ${requirement.code} was ${decision.replace('_', ' ')}`,
      link: `/app/requirements/${requirement.id}`,
    });

    return success(res, { message: `Requirement version ${decision.replace('_', ' ')}`, data: { approval, requirement } });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

// PATCH /api/v1/requirements/:id/implemented
async function markImplemented(req, res, next) {
  try {
    const requirement = await requirementService.markImplemented(req.params.id);
    await recordAudit({
      actorId: req.user.id,
      action: 'requirement.implemented',
      entityType: 'Requirement',
      entityId: requirement.id,
    });
    return success(res, { message: 'Requirement marked as implemented', data: requirement });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

module.exports = {
  createRequirement,
  listRequirements,
  getRequirement,
  addVersion,
  decideOnVersion,
  markImplemented,
};
