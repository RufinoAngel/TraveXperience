/**
 * models/mysql/WearableDevice.js
 * -----------------------------------------------------------------------
 * Módulo 5: Interconexión Wearable (Wear OS / Kotlin).
 *
 * Registro de los relojes que un usuario ha vinculado a su cuenta vía
 * código de emparejamiento (POST /wearable/pair/redeem). Permite listar
 * los dispositivos vinculados y desvincularlos desde la pantalla
 * "Dispositivos vinculados" de la app.
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');

const WearableDevice = sequelize.define(
  'WearableDevice',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Wear OS',
    },
    // Última vez que el reloj sincronizó ubicación/actividad. Opcional,
    // útil para mostrar "última conexión" en la pantalla de dispositivos.
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'wearable_devices',
  }
);

// Relación 1:N -> Un usuario puede tener varios relojes vinculados
User.hasMany(WearableDevice, { foreignKey: 'userId', as: 'wearableDevices' });
WearableDevice.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = WearableDevice;
