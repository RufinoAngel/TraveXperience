/**
 * controllers/presenceController.js
 * -----------------------------------------------------------------------
 * "Cuántas personas están viendo esto ahora mismo", en tiempo real y sin
 * necesidad de sockets: el frontend manda un heartbeat mientras el usuario
 * tiene la pantalla abierta, y consulta el conteo por polling corto.
 * -----------------------------------------------------------------------
 */

const Presence = require('../models/mongodb/Presence');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /presence/heartbeat
 * Body: { entityType: 'place'|'hotel', entityId, sessionId }
 *
 * "Sigo viendo esto": crea o refresca (upsert) el registro de presencia
 * de esta sesión sobre esta entidad. No valida que la entidad exista en
 * BD a propósito: el frontend llama esto cada ~15s mientras la pantalla
 * está abierta, y por eso se busca la operación más barata posible
 * (un único upsert indexado, sin joins ni populate).
 */
const heartbeat = async (req, res, next) => {
  try {
    const { entityType, entityId, sessionId } = req.body;

    const EntityModelName = Presence.ENTITY_MODEL_MAP[entityType];
    if (!EntityModelName) {
      throw new AppError('entityType inválido. Debe ser "place" u "hotel".', 422);
    }

    const presence = await Presence.findOneAndUpdate(
      { entityType, entityId, sessionId },
      {
        entityType,
        entityId,
        sessionId,
        entityModel: EntityModelName,
        userId: req.user ? req.user.id : null,
        source: req.headers['x-client-platform'] || 'mobile',
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return ApiResponse.success(res, 200, 'Presencia registrada.', {
      entityType: presence.entityType,
      entityId: presence.entityId,
      lastSeenAt: presence.lastSeenAt,
    });
  } catch (error) {
    // Condición de carrera en el upsert (doble heartbeat casi simultáneo
    // de la misma sesión, ej. reintento de red): no es un error real para
    // el frontend, así que se responde éxito igual.
    if (error.code === 11000) {
      return ApiResponse.success(res, 200, 'Presencia registrada.');
    }
    return next(error);
  }
};

/**
 * GET /presence?entityType=place&entityId=123
 *
 * Devuelve cuántas sesiones distintas han mandado heartbeat recientemente
 * sobre esta entidad. "Recientemente" es una ventana más corta que el TTL
 * de borrado (ver Presence.ACTIVE_WINDOW_SECONDS), para que el número no
 * incluya sesiones que ya llevan uno o dos heartbeats perdidos.
 */
const getPresence = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;

    if (!Presence.ENTITY_TYPES.includes(entityType)) {
      throw new AppError('Se requiere "entityType" ("place" u "hotel") como query param.', 422);
    }

    const activeSince = new Date(Date.now() - Presence.ACTIVE_WINDOW_SECONDS * 1000);

    const count = await Presence.countDocuments({
      entityType,
      entityId,
      lastSeenAt: { $gte: activeSince },
    });

    return ApiResponse.success(res, 200, 'Presencia obtenida.', { count });
  } catch (error) {
    return next(error);
  }
};
/**
 * POST /presence/leave
 * Body: { entityType: 'place'|'hotel', entityId, sessionId }
 *
 * "Ya no estoy viendo esto": borra el registro de presencia de esta
 * sesión sobre esta entidad de inmediato, en vez de esperar a que el
 * heartbeat deje de llegar y expire por ACTIVE_WINDOW_SECONDS/TTL.
 *
 * El frontend manda esto sobre todo vía navigator.sendBeacon al cerrar o
 * recargar la pestaña — sendBeacon no permite leer la respuesta ni
 * reintentar, así que aquí se responde 204 siempre que el body sea
 * razonable, sin tronar por datos ausentes o malformados (a diferencia de
 * heartbeat/getPresence, que sí exigen los campos vía validateRequest).
 */
const leave = async (req, res) => {
  const { entityType, entityId, sessionId } = req.body || {};

  if (!Presence.ENTITY_TYPES.includes(entityType) || !entityId || !sessionId) {
    // No hay nadie del otro lado leyendo esta respuesta (sendBeacon), así
    // que no tiene sentido devolver un 422 — simplemente no se borra nada.
    return res.status(204).end();
  }

  try {
    await Presence.findOneAndDelete({ entityType, entityId, sessionId });
  } catch {
    // Igual que arriba: no hay forma de que el frontend reaccione a un
    // error aquí, así que se ignora en vez de propagarlo con next(error).
  }

  return res.status(204).end();
};

module.exports = { heartbeat, getPresence, leave };
