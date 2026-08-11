/**
 * models/mysql/Itinerary.js
 * -----------------------------------------------------------------------
 * Modelo Sequelize para itinerarios turísticos ("Fuera de Casa").
 * Se relaciona con User mediante userId (clave foránea).
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');

const Itinerary = sequelize.define(
  'Itinerary',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estimatedBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    // Días, actividades y horarios en formato flexible (JSON)
    itineraryDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('borrador', 'confirmado', 'en_curso', 'finalizado', 'cancelado'),
      defaultValue: 'borrador',
    },
  },
  {
    tableName: 'itineraries',
  }
);

// Relación 1:N -> Un usuario puede tener muchos itinerarios
User.hasMany(Itinerary, { foreignKey: 'userId', as: 'itineraries' });
Itinerary.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = Itinerary;
