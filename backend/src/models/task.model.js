module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      projectId: { type: DataTypes.UUID, allowNull: false },
      milestoneId: { type: DataTypes.UUID, allowNull: true },
      parentTaskId: { type: DataTypes.UUID, allowNull: true }, // for subtasks
      assigneeId: { type: DataTypes.UUID, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
      status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'in_review', 'done'),
        defaultValue: 'todo',
      },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { tableName: 'tasks', timestamps: true }
  );
  return Task;
};
