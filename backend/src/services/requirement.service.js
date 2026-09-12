const { sequelize, Requirement, RequirementVersion, RequirementApproval, User, Project } = require('../models');

async function generateRequirementCode() {
  const count = await Requirement.count();
  return `REQ-${100 + count + 1}`;
}

// Creates a Requirement with its initial version (V1).
async function createRequirement({ projectId, title, body, priority, submittedBy }) {
  return sequelize.transaction(async (t) => {
    const code = await generateRequirementCode();

    const requirement = await Requirement.create(
      { code, projectId, title, priority, submittedBy, currentVersion: 1, status: 'submitted' },
      { transaction: t }
    );

    await RequirementVersion.create(
      { requirementId: requirement.id, versionNo: 1, body, changeSummary: 'Initial submission', createdBy: submittedBy },
      { transaction: t }
    );

    return requirement;
  });
}

async function getRequirementById(id) {
  return Requirement.findByPk(id, {
    include: [
      { model: Project, attributes: ['id', 'name', 'code'] },
      { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
      {
        model: RequirementVersion,
        as: 'versions',
        include: [
          { model: User, as: 'createdByUser', attributes: ['id', 'name'] },
          { model: RequirementApproval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['id', 'name'] }] },
        ],
        order: [['versionNo', 'DESC']],
      },
    ],
  });
}

async function listRequirements(query) {
  const where = {};
  if (query.projectId) where.projectId = query.projectId;
  if (query.status) where.status = query.status;

  return Requirement.findAll({
    where,
    include: [{ model: Project, attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
}

// Adds a new version to an existing requirement — freezes prior version,
// increments currentVersion, and resets status to 'submitted' for re-review.
async function addVersion(requirementId, { body, changeSummary, createdBy }) {
  return sequelize.transaction(async (t) => {
    const requirement = await Requirement.findByPk(requirementId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!requirement) {
      const err = new Error('Requirement not found');
      err.status = 404;
      throw err;
    }

    const nextVersionNo = requirement.currentVersion + 1;

    const version = await RequirementVersion.create(
      { requirementId, versionNo: nextVersionNo, body, changeSummary, createdBy },
      { transaction: t }
    );

    requirement.currentVersion = nextVersionNo;
    requirement.status = 'submitted';
    await requirement.save({ transaction: t });

    return version;
  });
}

// Approve / Reject / Request Clarification on a specific version.
async function decideOnVersion(versionId, { approverId, decision, note }) {
  return sequelize.transaction(async (t) => {
    const version = await RequirementVersion.findByPk(versionId, { transaction: t });
    if (!version) {
      const err = new Error('Requirement version not found');
      err.status = 404;
      throw err;
    }

    const approval = await RequirementApproval.create(
      { versionId, approverId, decision, note },
      { transaction: t }
    );

    const requirement = await Requirement.findByPk(version.requirementId, { transaction: t });
    const statusMap = {
      approved: 'approved',
      rejected: 'rejected',
      clarification_requested: 'clarification',
    };
    requirement.status = statusMap[decision] || requirement.status;
    await requirement.save({ transaction: t });

    return { approval, requirement };
  });
}

async function markImplemented(requirementId) {
  const requirement = await Requirement.findByPk(requirementId);
  if (!requirement) {
    const err = new Error('Requirement not found');
    err.status = 404;
    throw err;
  }
  requirement.status = 'implemented';
  await requirement.save();
  return requirement;
}

module.exports = {
  createRequirement,
  getRequirementById,
  listRequirements,
  addVersion,
  decideOnVersion,
  markImplemented,
};
