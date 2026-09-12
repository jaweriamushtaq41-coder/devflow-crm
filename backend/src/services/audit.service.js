const { AuditLog } = require('../models');

// Every sensitive action (status changes, approvals, deletions, role
// changes) should leave a visible record — this is the product principle
// stated in the official brief's Executive Brief.
async function recordAudit({ actorId, action, entityType, entityId, metadata = null, ipAddress = null }) {
  try {
    await AuditLog.create({ actorId, action, entityType, entityId, metadata, ipAddress });
  } catch (err) {
    // Audit failures should never break the main request flow, but must be visible in logs.
    // eslint-disable-next-line no-console
    console.error('[audit] Failed to record audit log:', err.message);
  }
}

module.exports = { recordAudit };
