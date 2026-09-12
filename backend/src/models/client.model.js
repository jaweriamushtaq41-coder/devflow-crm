module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    'Client',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      companyId: { type: DataTypes.UUID, allowNull: false },
      accountManagerId: { type: DataTypes.UUID, allowNull: true },
      portalUserId: { type: DataTypes.UUID, allowNull: true }, // links to Users table (role=client)
      billingInfo: { type: DataTypes.JSONB, allowNull: true },
      status: { type: DataTypes.ENUM('active', 'inactive', 'archived'), defaultValue: 'active' },
    },
    { tableName: 'clients', timestamps: true }
  );
  return Client;
};
