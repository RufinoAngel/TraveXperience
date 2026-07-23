/**
 * controllers/mapsController.js
 * -----------------------------------------------------------------------
 * Módulo Google Maps Platform (Geocoding API).
 * -----------------------------------------------------------------------
 */

const googleMapsService = require('../services/googleMapsService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /maps/geocode?address=
 * Uso principal: autocompletado de direcciones en formularios de admin
 * (registro de Places/Hoteles).
 */
const geocode = async (req, res, next) => {
  try {
    const { address } = req.query;

    let result;
    try {
      result = await googleMapsService.geocodeAddress(address);
    } catch (error) {
      if (error.code === 'NOT_FOUND') {
        throw new AppError('No se encontraron coordenadas para la dirección proporcionada.', 422);
      }
      throw new AppError('El servicio de geocodificación no está disponible en este momento.', 503);
    }

    return ApiResponse.success(res, 200, 'Dirección geocodificada.', result);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /maps/photo?ref=&maxwidth=
 * Proxy de fotos de Google Places: el navegador nunca ve la API key.
 * `ref` es el photo_reference que el backend guardó al crear el Place/Hotel.
 */
const getPlacePhoto = async (req, res, next) => {
  try {
    const { ref, maxwidth } = req.query;

    let photo;
    try {
      photo = await googleMapsService.fetchPlacePhoto(ref, maxwidth);
    } catch (error) {
      if (error.code === 'NOT_FOUND') {
        throw new AppError('La foto solicitada no está disponible.', 404);
      }
      throw new AppError('El servicio de fotos de Google Maps no está disponible en este momento.', 503);
    }

    res.set('Content-Type', photo.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // 24h, la foto de un lugar no cambia seguido
    return res.send(photo.buffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = { geocode, getPlacePhoto };
