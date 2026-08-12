/**
 * models/mysql/TransportRoute.js
 * -----------------------------------------------------------------------
 * Rutas de transporte (autobús/vuelo) registradas por un administrador.
 * Usado por Admin/registroTransporte.jsx en el frontend.
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');

const TransportRoute = sequelize.define(
  'TransportRoute',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    // Días de la semana en que corre la ruta, ej. ["L","M","X","J","V"]
    daysOfWeek: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'transport_routes',
  }
);

// Relación 1:N -> Un administrador puede tener muchas rutas
User.hasMany(TransportRoute, { foreignKey: 'ownerId', as: 'transportRoutes' });
TransportRoute.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = TransportRoute;
