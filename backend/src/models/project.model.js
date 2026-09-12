module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. PRJ-1001
      name: { type: DataTypes.STRING, allowNull: false },
      clientId: { type: DataTypes.UUID, allowNull: false },
      pmId: { type: DataTypes.UUID, allowNull: true },
      startDate: { type: DataTypes.DATEONLY, allowNull: true },
      endDate: { type: DataTypes.DATEONLY, allowNull: true },
      budget: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      status: {
        type: DataTypes.ENUM('planning', 'active', 'on_hold', 'in_review', 'uat', 'completed', 'archived'),
        defaultValue: 'planning',
      },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'projects', timestamps: true }
  );
  return Project;
};
