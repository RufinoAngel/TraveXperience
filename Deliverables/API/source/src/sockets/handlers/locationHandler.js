/**
 * sockets/handlers/locationHandler.js
 * -----------------------------------------------------------------------
 * Versión "en vivo" del Módulo 5 (Smartwatch): en vez de que el reloj
 * haga POST /wearable/location por polling y espere la respuesta HTTP,
 * emite su posición por socket y el backend empuja las alertas apenas
 * detecta lugares cercanos bien calificados.
 *
 * Reutiliza exactamente la misma lógica y umbrales que
 * src/controllers/wearableController.js (syncLocation/getAlerts), para
 * no duplicar reglas de negocio entre el endpoint REST y el socket.
 * -----------------------------------------------------------------------
 */

const geoService = require('../../services/geoService');
const ActivityLog = require('../../models/mongodb/ActivityLog');
const logger = require('../../utils/logger');

const ALERT_RADIUS_METERS = 300;
const ALERT_MIN_RATING = 4;

const toWatchPayload = (place, lat, lng) => ({
  id: place._id,
  name: place.name,
  category: place.category,
  lat: place.location.coordinates[1],
  lng: place.location.coordinates[0],
  distanceMeters: geoService.haversineDistanceMeters(
    Number(lat),
    Number(lng),
    place.location.coordinates[1],
    place.location.coordinates[0]
  ),
  ratingAvg: place.ratingAvg,
});

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
module.exports = (io, socket) => {
  /**
   * Evento entrante: 'location:update'
   * Payload esperado: { lat, lng }
   *
   * Equivalente en tiempo real a POST /wearable/location. Registra el
   * evento de tracking (no bloqueante, igual que el controlador REST) y
   * responde con 'alert:new' SOLO a este socket si hay lugares cercanos
   * dignos de notificación.
   */
  socket.on('location:update', async ({ lat, lng } = {}) => {
    try {
      if (lat === undefined || lng === undefined) {
        return socket.emit('location:error', {
          message: 'Se requieren "lat" y "lng".',
        });
      }

      // Log no bloqueante, igual que en el controlador REST.
      ActivityLog.create({
        userId: socket.user.id,
        eventType: 'wearable_sync',
        source: 'smartwatch',
        metadata: { lat: Number(lat), lng: Number(lng) },
      }).catch(() => {});

      let places = [];
      try {
        ({ places } = await geoService.findNearbyPlaces({
          lat,
          lng,
          radius: ALERT_RADIUS_METERS,
          limit: 5,
        }));
      } catch {
        places = [];
      }

      const alerts = places
        .filter((p) => (p.ratingAvg || 0) >= ALERT_MIN_RATING)
        .map((p) => toWatchPayload(p, lat, lng));

      if (alerts.length > 0) {
        // Se emite a la room del usuario (no solo a este socket), así
        // si tiene la app móvil y el reloj conectados a la vez, ambos
        // reciben la alerta.
        io.to(`user:${socket.user.id}`).emit('alert:new', { alerts });
      }
    } catch (error) {
      logger.error(`Error en location:update (user ${socket.user.id}): ${error.message}`);
      socket.emit('location:error', {
        message: 'No se pudo procesar la ubicación.',
      });
    }
  });
};
