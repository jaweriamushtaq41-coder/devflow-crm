module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    'Attachment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      entityType: { type: DataTypes.STRING, allowNull: false }, // 'task' | 'requirement' | 'project' | 'ticket'
      entityId: { type: DataTypes.UUID, allowNull: false },
      uploadedBy: { type: DataTypes.UUID, allowNull: false },
      originalName: { type: DataTypes.STRING, allowNull: false },
      mimeType: { type: DataTypes.STRING, allowNull: false },
      sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
      storagePath: { type: DataTypes.STRING, allowNull: false },
      isClientVisible: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: 'attachments', timestamps: true }
  );
  return Attachment;
};
