/**
 * sockets/handlers/itineraryHandler.js
 * -----------------------------------------------------------------------
 * Sincroniza el itinerario activo entre las 3 plataformas (Web, App
 * Móvil, Smartwatch) que comparten la misma cuenta vía JWT.
 *
 * No emite el update automáticamente por sí solo: se limita a dejar al
 * socket suscrito a la room del itinerario. Quien realmente dispara el
 * evento 'itinerary:updated' es src/controllers/itineraryController.js
 * (updateItinerary), reutilizando getIO() — así el REST sigue siendo la
 * única fuente de verdad para escribir datos, y el socket solo empuja
 * la notificación a quien esté escuchando.
 * -----------------------------------------------------------------------
 */

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
module.exports = (io, socket) => {
  /**
   * Evento entrante: 'itinerary:subscribe'
   * Payload esperado: { itineraryId }
   *
   * El cliente (web, app móvil o reloj) se suscribe al itinerario que
   * tiene abierto para recibir cambios en vivo si se edita desde otra
   * plataforma (ej. se agrega una actividad desde la Web mientras el
   * usuario ya está en el destino con el reloj puesto).
   */
  socket.on('itinerary:subscribe', ({ itineraryId } = {}) => {
    if (!itineraryId) {
      return socket.emit('itinerary:error', {
        message: 'Se requiere "itineraryId".',
      });
    }
    socket.join(`itinerary:${itineraryId}`);
  });

  socket.on('itinerary:unsubscribe', ({ itineraryId } = {}) => {
    if (itineraryId) {
      socket.leave(`itinerary:${itineraryId}`);
    }
  });
};
