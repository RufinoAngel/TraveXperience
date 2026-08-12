/**
 * models/mysql/WearablePairingCode.js
 * -----------------------------------------------------------------------
 * Módulo 5: Interconexión Wearable (Wear OS / Kotlin).
 *
 * Código corto de un solo uso que el celular genera (POST
 * /wearable/pair/generate-code) y el reloj canjea (POST
 * /wearable/pair/redeem) para obtener sus propias credenciales sin tener
 * que escribir usuario/contraseña en el reloj.
 *
 * Vive muy poco tiempo (unos 5 minutos) y se marca como usado en cuanto
 * el reloj lo canjea, así nunca se puede reutilizar. Se guarda en MySQL
 * en vez de Redis porque el proyecto no tiene Redis configurado; el
 * campo `expiresAt` cumple el mismo rol que un TTL.
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');

const WearablePairingCode = sequelize.define(
  'WearablePairingCode',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Código de 6 dígitos que el usuario transcribe en el reloj.
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // Se llena cuando el reloj canjea el código exitosamente.
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Nombre del dispositivo que canjeó el código (para el polling de estado).
    deviceName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'wearable_pairing_codes',
  }
);

// Relación 1:N -> Un usuario puede generar varios códigos a lo largo del tiempo
// (aunque solo uno debería estar activo/vigente a la vez).
User.hasMany(WearablePairingCode, { foreignKey: 'userId', as: 'wearablePairingCodes' });
WearablePairingCode.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = WearablePairingCode;
