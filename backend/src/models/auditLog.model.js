module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      actorId: { type: DataTypes.UUID, allowNull: true },
      action: { type: DataTypes.STRING, allowNull: false }, // 'lead.create', 'requirement.approve', ...
      entityType: { type: DataTypes.STRING, allowNull: false },
      entityId: { type: DataTypes.UUID, allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: true }, // safe before/after summary
      ipAddress: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: 'audit_logs', timestamps: true, updatedAt: false }
  );
  return AuditLog;
};
