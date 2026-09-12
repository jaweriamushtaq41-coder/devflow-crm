module.exports = (sequelize, DataTypes) => {
  const RequirementApproval = sequelize.define(
    'RequirementApproval',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      versionId: { type: DataTypes.UUID, allowNull: false },
      approverId: { type: DataTypes.UUID, allowNull: false },
      decision: { type: DataTypes.ENUM('approved', 'rejected', 'clarification_requested'), allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'requirement_approvals', timestamps: true }
  );
  return RequirementApproval;
};
