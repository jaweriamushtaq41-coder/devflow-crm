module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      entityType: { type: DataTypes.STRING, allowNull: false }, // 'task' | 'requirement' | 'ticket'
      entityId: { type: DataTypes.UUID, allowNull: false },
      authorId: { type: DataTypes.UUID, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: 'comments', timestamps: true }
  );
  return Comment;
};
