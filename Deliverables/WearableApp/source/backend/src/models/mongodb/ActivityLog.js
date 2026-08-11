/**
 * models/mongodb/ActivityLog.js
 * -----------------------------------------------------------------------
 * Registra eventos de comportamiento del usuario (clicks, búsquedas,
 * lugares vistos, tiempo de permanencia). Este flujo de datos de alto
 * volumen alimenta el reentrenamiento periódico de los modelos de
 * TensorFlow.js (clustering y predicción de presupuesto) y los mecanismos
 * de ML propuestos sobre activitylogs (detección de anomalías,
 * detección de destinos emergentes, comunidades de usuarios).
 *
 * `entityType`/`entityId` se agregan como campos de PRIMER NIVEL (antes
 * solo vivían escondidos dentro de `metadata`), para que se puedan
 * indexar y agregar directo en consultas/pipelines de análisis sin tener
 * que desempacar `metadata` cada vez.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const ENTITY_TYPES = ['place', 'hotel', 'itinerary', 'review'];

const activityLogSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'search',
        'view_place',
        'view_hotel',
        'save_favorite',
        'remove_favorite',
        'write_review',
        'book_itinerary',
        'app_open',
        'wearable_sync',
      ],
      required: true,
    },
    // Generalización de la entidad involucrada en el evento (opcional:
    // eventos como "search" o "app_open" no siempre tienen una entidad
    // puntual asociada).
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed, // payload flexible adicional según eventType
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
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const ActivityLogModel = model('ActivityLog', activityLogSchema);
ActivityLogModel.ENTITY_TYPES = ENTITY_TYPES;

module.exports = ActivityLogModel;
