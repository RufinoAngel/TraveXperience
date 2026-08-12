/**
 * controllers/favoriteController.js
 * -----------------------------------------------------------------------
 * Entidades (lugares u hoteles) guardadas como favoritas por el usuario
 * autenticado. Generalizado para soportar Place Y Hotel en la misma
 * colección (ver models/mongodb/Favorite.js).
 * -----------------------------------------------------------------------
 */

const Favorite = require('../models/mongodb/Favorite');
const Place = require('../models/mongodb/Place');
const Hotel = require('../models/mongodb/Hotel');
const ActivityLog = require('../models/mongodb/ActivityLog');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

const ENTITY_MODELS = { place: Place, hotel: Hotel };

/**
 * GET /favorites?entityType=
 * Devuelve las entidades favoritas del usuario, con el detalle completo
 * ya incluido (populate dinámico vía refPath) para que el frontend no
 * tenga que hacer una segunda llamada por cada tarjeta de favoritos.
 * Sin ?entityType, regresa favoritos de ambos tipos mezclados.
 */
const listFavorites = async (req, res, next) => {
  try {
    const { entityType } = req.query;
    const filter = { userId: req.user.id };
    if (entityType) filter.entityType = entityType;

    const favorites = await Favorite.find(filter)
      .sort({ createdAt: -1 })
      .populate('entityId')
      .lean();

    const items = favorites
      .filter((fav) => fav.entityId) // por si la entidad fue borrada después
      .map((fav) => ({
        favoriteId: fav._id,
        entityType: fav.entityType,
        savedAt: fav.createdAt,
        entity: fav.entityId,
      }));

    return ApiResponse.success(res, 200, 'Favoritos obtenidos.', { count: items.length, items });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /favorites
 * Body: { entityType: 'place'|'hotel', entityId }
 */
const addFavorite = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;

    const EntityModel = ENTITY_MODELS[entityType];
    if (!EntityModel) {
      throw new AppError('entityType inválido. Debe ser "place" u "hotel".', 422);
    }

    const entity = await EntityModel.findById(entityId);
    if (!entity) {
      throw new AppError('La entidad que intentas guardar no existe.', 404);
    }

    const favorite = await Favorite.findOneAndUpdate(
      { userId: req.user.id, entityType, entityId },
      { userId: req.user.id, entityType, entityId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    ActivityLog.create({
      userId: req.user.id,
      eventType: 'save_favorite',
      entityType,
      entityId,
      source: req.headers['x-client-platform'] || 'mobile',
    }).catch(() => {});

    return ApiResponse.success(res, 201, 'Agregado a favoritos.', { favorite });
  } catch (error) {
    if (error.code === 11000) {
      // Índice único violado por condición de carrera (doble click, etc.)
      return ApiResponse.success(res, 200, 'La entidad ya estaba en tus favoritos.');
    }
    return next(error);
  }
};

/**
 * DELETE /favorites/:entityId?entityType=place|hotel
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const { entityType } = req.query;

    if (!Favorite.ENTITY_TYPES.includes(entityType)) {
      throw new AppError('Se requiere "entityType" ("place" u "hotel") como query param.', 422);
    }

    const deleted = await Favorite.findOneAndDelete({ userId: req.user.id, entityType, entityId });

    if (!deleted) {
      throw new AppError('Esa entidad no está en tus favoritos.', 404);
    }

    ActivityLog.create({
      userId: req.user.id,
      eventType: 'remove_favorite',
      entityType,
      entityId,
      source: req.headers['x-client-platform'] || 'mobile',
    }).catch(() => {});

    return ApiResponse.success(res, 200, 'Eliminado de favoritos.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listFavorites, addFavorite, removeFavorite };
