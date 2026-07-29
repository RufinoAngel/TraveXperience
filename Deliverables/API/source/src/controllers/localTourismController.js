/**
 * controllers/localTourismController.js
 * -----------------------------------------------------------------------
 * Módulo 2: Turismo Local ("Cerca de Mí") — App Móvil.
 * "Búsqueda de lugares cercanos por categoría (playas, sitios culturales,
 * hoteles, restaurantes)... resultados rápidos basados en GPS."
 *
 * Devuelve el payload COMPLETO de cada lugar (fotos, descripción, tags).
 * El Smartwatch usa el mismo geoService pero con un payload reducido
 * (ver controllers/wearableController.js).
 * -----------------------------------------------------------------------
 */

const Place = require('../models/mongodb/Place');
const Favorite = require('../models/mongodb/Favorite');
const ActivityLog = require('../models/mongodb/ActivityLog');
const geoService = require('../services/geoService');
const googleMapsService = require('../services/googleMapsService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /local/nearby
 * Query params: lat, lng, radius (m, opcional), category (opcional), limit (opcional)
 */
const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius, category, limit, destination } = req.query;

    if (lat === undefined || lng === undefined) {
      throw new AppError('Se requieren los parámetros "lat" y "lng".', 400);
    }

    let places, maxDistance;
    try {
      ({ places, maxDistance } = await geoService.findNearbyPlaces({ lat, lng, radius, category, limit, destination }));
    } catch (geoError) {
      throw new AppError(geoError.message, 400);
    }

    // Log de actividad (no bloqueante) para alimentar el motor de ML
    ActivityLog.create({
      userId: req.user?.id,
      eventType: 'search',
      source: req.headers['x-client-platform'] || 'mobile',
      metadata: { lat: Number(lat), lng: Number(lng), category: category || 'todas', resultsCount: places.length },
    }).catch(() => {
      /* no se interrumpe la respuesta principal si el log falla */
    });

    let placesWithFavorites = places;
    if (req.user?.id) {
      const placeObjects = places.map((place) => (typeof place.toObject === 'function' ? place.toObject() : place));
      const placeIds = placeObjects.map((place) => place._id);
      const favorites = await Favorite.find({
        userId: req.user.id,
        entityType: 'place',
        entityId: { $in: placeIds },
      }).lean();
      const favoriteMap = new Map(favorites.map((fav) => [String(fav.entityId), fav._id]));

      placesWithFavorites = placeObjects.map((place) => ({
        ...place,
        isFavorite: favoriteMap.has(String(place._id)),
        favoriteId: favoriteMap.get(String(place._id)) || null,
      }));
    }

    return ApiResponse.success(res, 200, 'Lugares cercanos obtenidos.', {
      count: placesWithFavorites.length,
      radiusMeters: maxDistance,
      places: placesWithFavorites,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /local/categories
 * Devuelve el listado de categorías disponibles para poblar filtros en la UI.
 */
const getCategories = (req, res) => {
  return ApiResponse.success(res, 200, 'Categorías disponibles.', {
    categories: Place.CATEGORIES,
  });
};

/**
 * GET /local/places/:id
 * Detalle completo de un lugar (usado al tocar un resultado en la App Móvil).
 */
const getPlaceById = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id).lean();
    if (!place || !place.isActive) {
      throw new AppError('Lugar no encontrado.', 404);
    }

    ActivityLog.create({
      userId: req.user?.id,
      eventType: 'view_place',
      entityType: 'place',
      entityId: place._id,
      source: req.headers['x-client-platform'] || 'mobile',
      metadata: { placeName: place.name },
    }).catch(() => {});

    if (req.user?.id) {
      const favorite = await Favorite.findOne({
        userId: req.user.id,
        entityType: 'place',
        entityId: place._id,
      }).lean();
      place.isFavorite = !!favorite;
      place.favoriteId = favorite?._id || null;
    }

    return ApiResponse.success(res, 200, 'Detalle del lugar obtenido.', { place });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /local/places/:id
 * Solo administradores. Permite actualizar campos del lugar, incluidas las imágenes.
 */
const updatePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place || !place.isActive) {
      throw new AppError('Lugar no encontrado.', 404);
    }

    const editableFields = [
      'name',
      'category',
      'description',
      'address',
      'municipality',
      'images',
      'tags',
      'priceLevel',
      'isActive',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        place[field] = req.body[field];
      }
    });

    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      place.location = { type: 'Point', coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }

    await place.save();

    return ApiResponse.success(res, 200, 'Lugar actualizado correctamente.', { place });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /local/places
 * Solo administradores. Registra un lugar/hotel en el catálogo. Si no se
 * envían coordenadas ("lat"/"lng") pero sí "address", geocodifica
 * automáticamente con Google Maps antes de guardar.
 */
const createPlace = async (req, res, next) => {
  try {
    const { name, category, description, address, municipality, images, tags, priceLevel } = req.body;
    let { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      if (!address) {
        throw new AppError('Se requieren coordenadas ("lat"/"lng") o una "address" para geocodificar.', 422);
      }

      try {
        const geocoded = await googleMapsService.geocodeAddress(address);
        lat = geocoded.lat;
        lng = geocoded.lng;
      } catch (geoError) {
        if (geoError.code === 'NOT_FOUND') {
          throw new AppError('No se pudo geocodificar la dirección proporcionada.', 422);
        }
        throw new AppError('El servicio de geocodificación no está disponible en este momento.', 503);
      }
    }

    // Si el admin no subió ninguna imagen, intentamos localizar una foto
    // real del lugar en Google Places. Es "best effort": si Google no lo
    // tiene indexado o falla el servicio, el lugar se crea igual sin foto.
    let finalImages = images;
    let photoReference = null;
    if ((!images || images.length === 0)) {
      try {
        photoReference = await googleMapsService.findPlacePhotoReference(
          `${name}, ${address || municipality || 'Xicotepec, Puebla'}`
        );
        if (photoReference) {
          const apiBaseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
          finalImages = [googleMapsService.buildPhotoProxyUrl(apiBaseUrl, photoReference)];
        }
      } catch (photoError) {
        logger.warn(`No se pudo auto-asignar foto para "${name}": ${photoError.message}`);
      }

      if (!finalImages || finalImages.length === 0) {
        finalImages = [
          googleMapsService.buildFallbackImageUrl(`${name} ${address || municipality || 'Xicotepec Puebla'}`),
        ];
      }
    }

    let place;
    try {
      place = await Place.create({
        name,
        category,
        description,
        address,
        municipality,
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        images: finalImages,
        photoReference,
        tags,
        priceLevel,
      });
    } catch (validationError) {
      if (validationError.name === 'ValidationError') {
        throw new AppError('Los datos del lugar no son válidos.', 422, validationError.errors);
      }
      throw validationError;
    }

    return ApiResponse.success(res, 201, 'Lugar registrado correctamente.', { place });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNearbyPlaces, getCategories, getPlaceById, createPlace, updatePlace };
