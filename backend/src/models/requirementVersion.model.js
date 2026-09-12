module.exports = (sequelize, DataTypes) => {
  const RequirementVersion = sequelize.define(
    'RequirementVersion',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      requirementId: { type: DataTypes.UUID, allowNull: false },
      versionNo: { type: DataTypes.INTEGER, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      changeSummary: { type: DataTypes.STRING, allowNull: true }, // "what changed since last version"
      createdBy: { type: DataTypes.UUID, allowNull: false },
    },
    { tableName: 'requirement_versions', timestamps: true }
  );
  return RequirementVersion;
};
