module.exports = (sequelize, DataTypes) => {
  const Deal = sequelize.define(
    'Deal',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      leadId: { type: DataTypes.UUID, allowNull: true },
      companyId: { type: DataTypes.UUID, allowNull: true },
      ownerId: { type: DataTypes.UUID, allowNull: true },
      value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      probability: { type: DataTypes.INTEGER, defaultValue: 10 },
      stage: {
        type: DataTypes.ENUM('new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'),
        defaultValue: 'new_lead',
      },
      expectedCloseDate: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { tableName: 'deals', timestamps: true }
  );
  return Deal;
};
