/**
 * models/mongodb/Presence.js
 * -----------------------------------------------------------------------
 * Registro efímero de "quién está viendo qué ahora mismo". Cada sesión de
 * frontend manda un heartbeat cada ~15s (ver presenceController.heartbeat);
 * este modelo guarda UN documento por (entityType, entityId, sessionId) y
 * lo va actualizando (upsert) en cada heartbeat en vez de acumular histórico,
 * ya que a diferencia de ActivityLog esto no es un log de analítica sino
 * un estado "vivo" que solo importa mientras la sesión sigue activa.
 *
 * Dos mecanismos de expiración trabajan en conjunto:
 *   1. Índice TTL sobre `lastSeenAt` (Mongo borra el doc solo, sin cron)
 *      como red de seguridad para no acumular basura si el frontend se
 *      cierra sin avisar (no hay "beforeunload" confiable en móvil).
 *   2. El propio conteo (ver presenceController.getPresence) filtra además
 *      por una ventana de "actividad reciente" más corta que el TTL, para
 *      que el número en pantalla no incluya sesiones a punto de expirar
 *      pero que ya llevan uno o dos heartbeats perdidos.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const ENTITY_TYPES = ['place', 'hotel'];
const ENTITY_MODEL_MAP = { place: 'Place', hotel: 'Hotel' };

// Tiempo tras el cual, sin heartbeats nuevos, se considera que la sesión
// ya no está viendo la entidad (frontend hace heartbeat cada 15s, así que
// esto tolera hasta un heartbeat perdido antes de dejar de contar).
const ACTIVE_WINDOW_SECONDS = 30;

// TTL real de borrado en Mongo: un poco más laxo que la ventana de conteo,
// simplemente para que el borrado físico no compita en el límite exacto
// con el filtro de conteo de arriba.
const TTL_SECONDS = 45;

const presenceSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
      required: true,
    },
    entityModel: {
      type: String,
      enum: Object.values(ENTITY_MODEL_MAP),
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityModel',
    },
    // Identificador de sesión generado por el frontend (no requiere login,
    // así también se puede mostrar "N personas viendo esto" con usuarios
    // anónimos explorando el catálogo).
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Si la sesión SÍ está autenticada, se guarda para uso futuro
    // (ej. no contar dos veces al mismo usuario logueado en dos tabs).
    userId: {
      type: Number,
      default: null,
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'smartwatch'],
      default: 'mobile',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Una sesión solo puede tener UN registro de presencia por entidad: cada
// heartbeat hace upsert sobre esta combinación en vez de insertar de más.
presenceSchema.index({ entityType: 1, entityId: 1, sessionId: 1 }, { unique: true });

// Índice usado por el conteo en tiempo real (GET /presence).
presenceSchema.index({ entityType: 1, entityId: 1, lastSeenAt: -1 });

// Índice TTL: Mongo revisa este índice en segundo plano (~cada 60s) y
// borra solo los documentos cuyo lastSeenAt ya venció.
presenceSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: TTL_SECONDS });

presenceSchema.pre('validate', function setEntityModel(next) {
  if (this.entityType && !this.entityModel) {
    this.entityModel = ENTITY_MODEL_MAP[this.entityType];
  }
  next();
});

const PresenceModel = model('Presence', presenceSchema);
PresenceModel.ENTITY_TYPES = ENTITY_TYPES;
PresenceModel.ENTITY_MODEL_MAP = ENTITY_MODEL_MAP;
PresenceModel.ACTIVE_WINDOW_SECONDS = ACTIVE_WINDOW_SECONDS;

module.exports = PresenceModel;
