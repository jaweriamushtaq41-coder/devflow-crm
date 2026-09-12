module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending_verification'),
        defaultValue: 'pending_verification',
      },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
      emailVerificationExpires: { type: DataTypes.DATE, allowNull: true },
      passwordResetToken: { type: DataTypes.STRING, allowNull: true },
      passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
      refreshTokenHash: { type: DataTypes.STRING, allowNull: true },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true },
      roleId: { type: DataTypes.UUID, allowNull: true },
      departmentId: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'users',
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash', 'refreshTokenHash', 'emailVerificationToken', 'passwordResetToken'] },
      },
      scopes: {
        withSecrets: { attributes: {} },
      },
    }
  );

  return User;
};
