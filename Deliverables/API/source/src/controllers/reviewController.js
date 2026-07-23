/**
 * controllers/reviewController.js
 * -----------------------------------------------------------------------
 * Módulo 4: Sistema de Reseñas.
 * Publicación, edición y consulta de calificaciones (1-5 estrellas),
 * almacenadas en MongoDB. Cada cambio recalcula el promedio denormalizado
 * (ratingAvg / ratingCount) en el documento Place correspondiente, para
 * que la App Móvil y el Smartwatch puedan leer la calificación sin
 * necesidad de agregar sobre la colección de reseñas en cada consulta.
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const Review = require('../models/mongodb/Review');
const Place = require('../models/mongodb/Place');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Recalcula ratingAvg y ratingCount de un Place a partir de sus reseñas.
 */
const recalculatePlaceRating = async (placeId) => {
  const stats = await Review.aggregate([
    { $match: { placeId: String(placeId) } },
    { $group: { _id: '$placeId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};

  await Place.findByIdAndUpdate(placeId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

/**
 * GET /reviews?placeId=...
 * Público: cualquiera puede consultar las reseñas de un lugar.
 */
const listReviews = async (req, res, next) => {
  try {
    const { placeId } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 50);

    const filter = placeId ? { placeId } : {};

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 200, 'Reseñas obtenidas.', { total, page, pageSize, reviews });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /reviews
 * Crea una reseña. Un usuario solo puede reseñar un mismo lugar una vez
 * (si ya existe, se recomienda usar PUT /reviews/:id para editarla).
 */
const createReview = async (req, res, next) => {
  try {
    const { placeId, placeName, rating, comment, photos, tags } = req.body;

    if (!mongoose.isValidObjectId(placeId)) {
      throw new AppError('El identificador del lugar (placeId) no es válido.', 422);
    }

    const place = await Place.findById(placeId);
    if (!place) {
      throw new AppError('El lugar reseñado no existe.', 404);
    }

    const existing = await Review.findOne({ placeId, userId: req.user.id });
    if (existing) {
      throw new AppError('Ya has calificado este lugar. Edita tu reseña existente.', 409);
    }

    const review = await Review.create({
      userId: req.user.id,
      placeId,
      placeName: placeName || place.name,
      rating,
      comment,
      photos,
      tags,
    });

    await recalculatePlaceRating(placeId);

    return ApiResponse.success(res, 201, 'Reseña publicada.', { review });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /reviews/:id
 * Solo el autor de la reseña puede editarla.
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError('Reseña no encontrada.', 404);
    }
    if (review.userId !== req.user.id) {
      throw new AppError('No tienes permiso para editar esta reseña.', 403);
    }

    const { rating, comment, photos, tags } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (photos !== undefined) review.photos = photos;
    if (tags !== undefined) review.tags = tags;

    await review.save();
    await recalculatePlaceRating(review.placeId);

    return ApiResponse.success(res, 200, 'Reseña actualizada.', { review });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /reviews/:id
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError('Reseña no encontrada.', 404);
    }
    if (review.userId !== req.user.id && req.user.role !== 'administrador') {
      throw new AppError('No tienes permiso para eliminar esta reseña.', 403);
    }

    await review.deleteOne();
    await recalculatePlaceRating(review.placeId);

    return ApiResponse.success(res, 200, 'Reseña eliminada.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listReviews, createReview, updateReview, deleteReview };
