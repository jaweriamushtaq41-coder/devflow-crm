module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      key: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. 'leads.view'
      description: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: 'permissions', timestamps: false }
  );
  return Permission;
};
