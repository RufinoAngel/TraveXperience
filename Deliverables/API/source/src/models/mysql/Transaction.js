/**
 * models/mysql/Transaction.js
 * -----------------------------------------------------------------------
 * Historial de cobros realizados a través de Stripe. Se crea en estado
 * "pending" al generar el PaymentIntent y se actualiza vía webhook
 * (payment_intent.succeeded / payment_intent.payment_failed, etc.).
 * Se relaciona opcionalmente con un Itinerary (un pago puede no estar
 * ligado a ningún itinerario, ej. una suscripción o servicio suelto).
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');
const Itinerary = require('./Itinerary');

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'stripe',
    },
    providerPaymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    amount: {
      // Monto en la unidad principal de la moneda (ej. 250.00), no en centavos.
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'mxn',
    },
    status: {
      type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    description: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    tableName: 'transactions',
  }
);

// Relación 1:N -> Un usuario puede tener muchas transacciones
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Relación 1:N opcional -> Un itinerario puede tener transacciones asociadas
Itinerary.hasMany(Transaction, { foreignKey: 'itineraryId', as: 'transactions' });
Transaction.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

module.exports = Transaction;
