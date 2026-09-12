module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    'Contact',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      companyId: { type: DataTypes.UUID, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: 'contacts', timestamps: true }
  );
  return Contact;
};
