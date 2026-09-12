module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      number: { type: DataTypes.STRING, allowNull: false, unique: true }, // INV-2026-001
      clientId: { type: DataTypes.UUID, allowNull: false },
      projectId: { type: DataTypes.UUID, allowNull: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM('draft', 'issued', 'sent', 'partially_paid', 'paid', 'overdue'),
        defaultValue: 'draft',
      },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'invoices', timestamps: true }
  );
  return Invoice;
};
