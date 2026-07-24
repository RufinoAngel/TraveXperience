/**
 * controllers/weatherController.js
 * -----------------------------------------------------------------------
 * Módulo Clima. Consulta OpenWeatherMap por coordenadas, o por el nombre
 * de un destino (en cuyo caso primero se geocodifica con Google Maps).
 * -----------------------------------------------------------------------
 */

const weatherService = require('../services/weatherService');
const googleMapsService = require('../services/googleMapsService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /weather?lat=&lng=
 * GET /weather?destination=Xicotepec+de+Juárez
 */
const getWeather = async (req, res, next) => {
  try {
    let { lat, lng } = req.query;
    const { destination } = req.query;

    if ((lat === undefined || lng === undefined) && !destination) {
      throw new AppError('Se requieren los parámetros "lat" y "lng", o bien "destination".', 400);
    }

    if ((lat === undefined || lng === undefined) && destination) {
      try {
        const geocoded = await googleMapsService.geocodeAddress(destination);
        lat = geocoded.lat;
        lng = geocoded.lng;
      } catch (geoError) {
        if (geoError.code === 'NOT_FOUND') {
          throw new AppError('No se pudo ubicar el destino indicado.', 422);
        }
        throw new AppError('El servicio de geocodificación no está disponible en este momento.', 503);
      }
    }

    let weather;
    try {
      weather = await weatherService.getWeatherByCoords(lat, lng);
    } catch (weatherError) {
      throw new AppError('El servicio de clima no está disponible en este momento.', 503);
    }

    return ApiResponse.success(res, 200, 'Clima obtenido.', { weather });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getWeather };
