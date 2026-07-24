/**
 * controllers/hotelController.js
 * -----------------------------------------------------------------------
 * CRUD de hoteles para administradores (Admin/registroHotel.jsx,
 * Admin/inventario.jsx en el frontend) + búsqueda pública/geoespacial
 * para la App Móvil y la Plataforma Web.
 *
 * Sigue el mismo patrón que localTourismController.createPlace: si el
 * admin no manda lat/lng pero sí una dirección de texto, se geocodifica
 * automáticamente con Google Maps antes de guardar.
 * -----------------------------------------------------------------------
 */

const Hotel = require('../models/mongodb/Hotel');
const Favorite = require('../models/mongodb/Favorite');
const ActivityLog = require('../models/mongodb/ActivityLog');
const googleMapsService = require('../services/googleMapsService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const DEFAULT_RADIUS_METERS = 10000;
const MAX_RADIUS_METERS = 50000;

/** Verifica que el hotel exista y pertenezca al admin autenticado. */
const findOwnedHotel = async (id, user) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError('Hotel no encontrado.', 404);
  }
  if (hotel.ownerId !== user.id) {
    throw new AppError('No tienes permiso para modificar este hotel.', 403);
  }
  return hotel;
};

/**
 * GET /hotels
 * Listado público con filtros simples y paginación (Plataforma Web / inventario admin).
 * Un administrador que pase ?mine=true solo ve los suyos (Admin/inventario.jsx).
 */
const listHotels = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 12, 50);

    const filter = { isActive: true };
    if (req.query.municipality) filter.municipality = req.query.municipality;
    if (req.query.mine === 'true' && req.user) filter.ownerId = req.user.id;

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Hotel.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 200, 'Hoteles obtenidos.', { total, page, pageSize, hotels });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /hotels/nearby?lat=&lng=&radius=
 * Búsqueda geoespacial, análoga a GET /local/nearby pero sobre el catálogo de hoteles.
 */
const getNearbyHotels = async (req, res, next) => {
  try {
    const { lat, lng, radius, limit } = req.query;

    if (lat === undefined || lng === undefined) {
      throw new AppError('Se requieren los parámetros "lat" y "lng".', 400);
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const maxDistance = Math.min(Number(radius) || DEFAULT_RADIUS_METERS, MAX_RADIUS_METERS);
    const resultLimit = Math.min(Number(limit) || 20, 50);

    const hotels = await Hotel.find({
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: maxDistance,
        },
      },
    }).limit(resultLimit);

    // Log de actividad (no bloqueante) — mismo patrón que localTourismController,
    // necesario para que los mecanismos de ML sobre activitylogs tengan
    // datos simétricos de places y hotels.
    ActivityLog.create({
      userId: req.user?.id,
      eventType: 'search',
      entityType: 'hotel',
      source: req.headers['x-client-platform'] || 'mobile',
      metadata: { lat: latitude, lng: longitude, resultsCount: hotels.length },
    }).catch(() => {});

    return ApiResponse.success(res, 200, 'Hoteles cercanos obtenidos.', {
      count: hotels.length,
      radiusMeters: maxDistance,
      hotels,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /hotels/:id
 */
const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel || !hotel.isActive) {
      throw new AppError('Hotel no encontrado.', 404);
    }

    ActivityLog.create({
      userId: req.user?.id,
      eventType: 'view_hotel',
      entityType: 'hotel',
      entityId: hotel._id,
      source: req.headers['x-client-platform'] || 'mobile',
      metadata: { hotelName: hotel.name },
    }).catch(() => {});

    if (req.user?.id) {
      const favorite = await Favorite.findOne({
        userId: req.user.id,
        entityType: 'hotel',
        entityId: hotel._id,
      }).lean();
      hotel.isFavorite = !!favorite;
      hotel.favoriteId = favorite?._id || null;
    }

    return ApiResponse.success(res, 200, 'Detalle del hotel obtenido.', { hotel });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /hotels
 * Solo administradores. Si no se envían lat/lng pero sí address, geocodifica con Google Maps.
 */
const createHotel = async (req, res, next) => {
  try {
    const {
      name, category, description, address, municipality,
      mainImage, images, amenities, rooms,
    } = req.body;
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

    // Igual que en localTourismController.createPlace: si no hay imágenes,
    // se intenta localizar una foto real en Google Places (best effort).
    let finalMainImage = mainImage;
    let finalImages = images;
    let photoReference = null;
    if (!mainImage && (!images || images.length === 0)) {
      try {
        photoReference = await googleMapsService.findPlacePhotoReference(
          `${name}, ${address || municipality || 'Xicotepec, Puebla'}`
        );
        if (photoReference) {
          const apiBaseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
          const photoUrl = googleMapsService.buildPhotoProxyUrl(apiBaseUrl, photoReference);
          finalMainImage = photoUrl;
          finalImages = [photoUrl];
        }
      } catch (photoError) {
        logger.warn(`No se pudo auto-asignar foto para el hotel "${name}": ${photoError.message}`);
      }

      if (!finalMainImage && (!finalImages || finalImages.length === 0)) {
        const fallbackImage = googleMapsService.buildFallbackImageUrl(`${name} ${address || municipality || 'Xicotepec Puebla'}`);
        finalMainImage = fallbackImage;
        finalImages = [fallbackImage];
      }
    }

    const hotel = await Hotel.create({
      name,
      category,
      description,
      address,
      municipality,
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      mainImage: finalMainImage,
      images: finalImages,
      photoReference,
      amenities,
      rooms,
      ownerId: req.user.id,
    });

    return ApiResponse.success(res, 201, 'Hotel registrado.', { hotel });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /hotels/:id
 * Solo el administrador dueño del hotel puede editarlo.
 */
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await findOwnedHotel(req.params.id, req.user);

    const editableFields = [
      'name', 'category', 'description', 'address', 'municipality',
      'mainImage', 'images', 'amenities', 'rooms', 'isActive',
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      hotel.location = { type: 'Point', coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }

    await hotel.save();

    return ApiResponse.success(res, 200, 'Hotel actualizado.', { hotel });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /hotels/:id
 */
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await findOwnedHotel(req.params.id, req.user);
    await hotel.deleteOne();
    return ApiResponse.success(res, 200, 'Hotel eliminado.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHotels,
  getNearbyHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
