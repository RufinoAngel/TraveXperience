/**
 * sockets/handlers/weatherHandler.js
 * -----------------------------------------------------------------------
 * Broadcast periódico de clima (OPCIONAL).
 *
 * El clima cambia lento y ya se consulta bajo demanda vía
 * GET /api/v1/weather, con caché de 12 min en weatherService. Por eso
 * este handler NO consulta el clima por cada socket conectado: en vez
 * de eso, corre un único cron cada 15 min que:
 *
 *   1. Busca los itinerarios con status = 'en_curso' (viaje activo).
 *   2. Geocodifica su destino y consulta el clima UNA sola vez por
 *      destino (aprovechando la caché de weatherService).
 *   3. Emite 'weather:update' a la room `itinerary:<id>` correspondiente.
 *
 * Así, quien tenga la Web/App/Reloj abiertos en ese itinerario reciben
 * el clima actualizado sin pedirlo, y sin multiplicar llamadas a la API
 * externa por cada conexión de socket.
 * -----------------------------------------------------------------------
 */

const cron = require('node-cron');
const { Op } = require('sequelize');

const Itinerary = require('../../models/mysql/Itinerary');
const googleMapsService = require('../../services/googleMapsService');
const weatherService = require('../../services/weatherService');
const logger = require('../../utils/logger');

const CRON_SCHEDULE = '*/15 * * * *'; // cada 15 minutos

const broadcastWeatherForActiveItineraries = async (io) => {
  const today = new Date().toISOString().slice(0, 10);

  const activeItineraries = await Itinerary.findAll({
    where: {
      status: 'en_curso',
      startDate: { [Op.lte]: today },
      endDate: { [Op.gte]: today },
    },
  });

  if (activeItineraries.length === 0) return;

  // Evita geocodificar/consultar clima repetido si varios itinerarios
  // activos comparten el mismo destino textual.
  const destinationsCache = new Map();

  for (const itinerary of activeItineraries) {
    try {
      const room = `itinerary:${itinerary.id}`;

      // Solo trabajar si hay alguien realmente escuchando esa room.
      const listeners = await io.in(room).fetchSockets();
      if (listeners.length === 0) continue;

      let weather = destinationsCache.get(itinerary.destination);

      if (!weather) {
        const { lat, lng } = await googleMapsService.geocodeAddress(itinerary.destination);
        weather = await weatherService.getWeatherByCoords(lat, lng);
        destinationsCache.set(itinerary.destination, weather);
      }

      io.to(room).emit('weather:update', {
        itineraryId: itinerary.id,
        destination: itinerary.destination,
        weather,
      });
    } catch (error) {
      // Un destino fallido (geocodificación o API de clima caída) no debe
      // detener el broadcast del resto de itinerarios activos.
      logger.warn(
        `weatherHandler: no se pudo emitir clima para itinerario ${itinerary.id}: ${error.message}`
      );
    }
  }
};

/**
 * @param {import('socket.io').Server} io
 */
const startWeatherBroadcast = (io) => {
  cron.schedule(CRON_SCHEDULE, () => {
    broadcastWeatherForActiveItineraries(io).catch((error) => {
      logger.error(`weatherHandler: fallo el broadcast de clima: ${error.message}`);
    });
  });

  logger.info(`🌤️  Broadcast de clima por socket programado (${CRON_SCHEDULE}).`);
};

module.exports = { startWeatherBroadcast };
