/**
 * models/mysql/User.js
 * -----------------------------------------------------------------------
 * Modelo Sequelize para la entidad Usuario. Representa tanto viajeros
 * ("usuario") como cuentas administradoras ("administrador"), según el
 * mock de "Crea tu cuenta" (selector Usuario / Administrador).
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      // Nulo para cuentas creadas exclusivamente vía "Continuar con Google"
      // (no tienen contraseña propia hasta que la configuren manualmente).
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // ID único de Google (campo "sub" del token verificado). Presente solo
    // en cuentas vinculadas con Google Sign-In.
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('usuario', 'administrador'),
      allowNull: false,
      defaultValue: 'usuario',
    },
    companyName: {
      // Solo aplica cuando role = 'administrador'
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    // Campos de perfil público (usados por la pantalla "Mi Perfil" del frontend)
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location: {
      // Ciudad/lugar declarado por el usuario, ej. "Xicotepec de Juárez, Puebla"
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    profilePhoto: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Foto de perfil ("avatar") gestionada desde PUT /auth/profile/avatar.
    // Se guarda como URL/ruta pública (o referencia) al archivo ya
    // almacenado por el mismo mecanismo que usa profilePhoto; la app
    // sabe convertir cualquiera de las dos formas en una imagen visible.
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    // Preferencias de viaje usadas como input del modelo de clustering
    travelPreferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Hash del refresh token vigente. Permite invalidar sesiones (logout)
    // sin necesidad de una tabla/blacklist adicional.
    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Recuperación de contraseña
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Módulo Pagos (Stripe): id del Customer en Stripe, reutilizado tanto
    // para PaymentIntents como para SetupIntents (tarjetas guardadas).
    stripeCustomerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
  }
);

module.exports = User;
