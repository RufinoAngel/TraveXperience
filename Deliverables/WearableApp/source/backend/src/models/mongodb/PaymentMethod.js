/**
 * models/mongodb/PaymentMethod.js
 * -----------------------------------------------------------------------
 * Métodos de pago aceptados por la plataforma (no confundir con
 * `SavedCard`, que son las tarjetas guardadas de un usuario final vía
 * Stripe). Este catálogo lo administra el equipo de TraveXperience desde
 * el panel de Admin > Finanzas > Métodos de pago, para decidir qué
 * opciones de cobro se muestran/activan en el checkout (tarjeta, PayPal,
 * transferencia, efectivo en OXXO, etc.).
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const TYPES = ['tarjeta', 'paypal', 'transferencia', 'efectivo', 'oxxo', 'otro'];

const paymentMethodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: TYPES,
      required: true,
    },
    provider: {
      // ej. "stripe", "paypal", "manual"
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Configuración adicional específica del proveedor (llaves públicas,
    // instrucciones de transferencia, etc.). Nunca debe contener secretos.
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // Puente lógico al id numérico de users (MySQL) del admin que lo registró
    createdBy: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true, collection: 'payment_methods' }
);

const PaymentMethodModel = model('PaymentMethod', paymentMethodSchema);
PaymentMethodModel.TYPES = TYPES;

module.exports = PaymentMethodModel;
