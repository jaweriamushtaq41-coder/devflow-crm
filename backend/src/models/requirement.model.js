module.exports = (sequelize, DataTypes) => {
  const Requirement = sequelize.define(
    'Requirement',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. REQ-104
      projectId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      submittedBy: { type: DataTypes.UUID, allowNull: false },
      currentVersion: { type: DataTypes.INTEGER, defaultValue: 1 },
      priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
      status: {
        type: DataTypes.ENUM('draft', 'submitted', 'clarification', 'approved', 'rejected', 'implemented'),
        defaultValue: 'draft',
      },
    },
    { tableName: 'requirements', timestamps: true }
  );
  return Requirement;
};
