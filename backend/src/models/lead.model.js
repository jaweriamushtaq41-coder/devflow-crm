module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define(
    'Lead',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING, allowNull: true },
      companyId: { type: DataTypes.UUID, allowNull: true },
      contactId: { type: DataTypes.UUID, allowNull: true },
      ownerId: { type: DataTypes.UUID, allowNull: true },
      source: { type: DataTypes.STRING, allowNull: true }, // referral, website, cold-call...
      score: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived'),
        defaultValue: 'new',
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: 'leads', timestamps: true }
  );
  return Lead;
};
