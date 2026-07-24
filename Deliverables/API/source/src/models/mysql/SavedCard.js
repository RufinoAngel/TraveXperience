/**
 * models/mysql/SavedCard.js
 * -----------------------------------------------------------------------
 * Tarjetas guardadas por el usuario a través de Stripe SetupIntents.
 * NUNCA se almacena número de tarjeta ni CVC: solo el identificador del
 * PaymentMethod que devuelve Stripe (providerPaymentMethodId) y los
 * metadatos no sensibles necesarios para mostrarla en la UI
 * (brand/last4/expiry).
 * -----------------------------------------------------------------------
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const User = require('./User');

const SavedCard = sequelize.define(
  'SavedCard',
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
    // Identificador del PaymentMethod en Stripe (pm_xxx). No es el número
    // de tarjeta; es seguro persistirlo, pero de todas formas nunca se
    // expone completo en las respuestas de la API.
    providerPaymentMethodId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    last4: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    expMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'saved_cards',
  }
);

// Relación 1:N -> Un usuario puede tener varias tarjetas guardadas
User.hasMany(SavedCard, { foreignKey: 'userId', as: 'savedCards' });
SavedCard.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = SavedCard;
