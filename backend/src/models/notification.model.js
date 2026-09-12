module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false }, // 'lead_assigned', 'task_assigned', ...
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: true },
      link: { type: DataTypes.STRING, allowNull: true },
      readAt: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'notifications', timestamps: true }
  );
  return Notification;
};
