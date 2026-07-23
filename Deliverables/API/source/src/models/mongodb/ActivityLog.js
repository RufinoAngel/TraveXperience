/**
 * models/mongodb/ActivityLog.js
 * -----------------------------------------------------------------------
 * Registra eventos de comportamiento del usuario (clicks, búsquedas,
 * lugares vistos, tiempo de permanencia). Este flujo de datos de alto
 * volumen alimenta el reentrenamiento periódico de los modelos de
 * TensorFlow.js (clustering y predicción de presupuesto).
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const activityLogSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['search', 'view_place', 'save_favorite', 'book_itinerary', 'app_open', 'wearable_sync'],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed, // payload flexible según eventType
      default: {},
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'smartwatch'],
      default: 'web',
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = model('ActivityLog', activityLogSchema);
