module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    'Ticket',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true }, // TCK-1001
      clientId: { type: DataTypes.UUID, allowNull: false },
      projectId: { type: DataTypes.UUID, allowNull: true },
      createdBy: { type: DataTypes.UUID, allowNull: false },
      assignedTo: { type: DataTypes.UUID, allowNull: true },
      subject: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'waiting_client', 'resolved', 'closed'),
        defaultValue: 'open',
      },
    },
    { tableName: 'tickets', timestamps: true }
  );
  return Ticket;
};
