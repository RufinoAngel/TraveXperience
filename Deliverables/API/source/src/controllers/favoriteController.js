/**
 * controllers/favoriteController.js
 * -----------------------------------------------------------------------
 * Lugares guardados como favoritos por el usuario autenticado.
 * -----------------------------------------------------------------------
 */

const Favorite = require('../models/mongodb/Favorite');
const Place = require('../models/mongodb/Place');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /favorites
 * Devuelve los lugares favoritos del usuario, con el detalle del Place
 * ya incluido (populate) para que el frontend no tenga que hacer una
 * segunda llamada por cada tarjeta de favoritos.
 */
const listFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('placeId')
      .lean();

    const places = favorites
      .filter((fav) => fav.placeId) // por si el Place fue borrado después
      .map((fav) => ({ favoriteId: fav._id, savedAt: fav.createdAt, place: fav.placeId }));

    return ApiResponse.success(res, 200, 'Favoritos obtenidos.', { count: places.length, places });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /favorites
 * Body: { placeId }
 */
const addFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.body;

    const place = await Place.findById(placeId);
    if (!place) {
      throw new AppError('El lugar que intentas guardar no existe.', 404);
    }

    const favorite = await Favorite.findOneAndUpdate(
      { userId: req.user.id, placeId },
      { userId: req.user.id, placeId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return ApiResponse.success(res, 201, 'Lugar agregado a favoritos.', { favorite });
  } catch (error) {
    if (error.code === 11000) {
      // Índice único violado por condición de carrera (doble click, etc.)
      return ApiResponse.success(res, 200, 'El lugar ya estaba en tus favoritos.');
    }
    return next(error);
  }
};

/**
 * DELETE /favorites/:placeId
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const deleted = await Favorite.findOneAndDelete({ userId: req.user.id, placeId });

    if (!deleted) {
      throw new AppError('Ese lugar no está en tus favoritos.', 404);
    }

    return ApiResponse.success(res, 200, 'Lugar eliminado de favoritos.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listFavorites, addFavorite, removeFavorite };
