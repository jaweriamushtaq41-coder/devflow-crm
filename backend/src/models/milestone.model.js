module.exports = (sequelize, DataTypes) => {
  const Milestone = sequelize.define(
    'Milestone',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      projectId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'), defaultValue: 'pending' },
      progress: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0-100
    },
    { tableName: 'milestones', timestamps: true }
  );
  return Milestone;
};
