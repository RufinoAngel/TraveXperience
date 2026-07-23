/**
 * models/mysql/TransportFareClass.js
 * -----------------------------------------------------------------------
 * Tabla hija de TransportRoute (relación 1:N) — clases de tarifa por
 * ruta (ej. "Turista", "Business", "First Class").
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const TransportRoute = require('./TransportRoute');

const TransportFareClass = sequelize.define(
  'TransportFareClass',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    occupancyPct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
  },
  {
    tableName: 'transport_fare_classes',
  }
);

// Relación 1:N -> Una ruta puede tener varias clases de tarifa
TransportRoute.hasMany(TransportFareClass, {
  foreignKey: 'routeId',
  as: 'fareClasses',
  onDelete: 'CASCADE',
});
TransportFareClass.belongsTo(TransportRoute, { foreignKey: 'routeId', as: 'route' });

module.exports = TransportFareClass;
