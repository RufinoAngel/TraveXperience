/**
 * controllers/reviewController.js
 * -----------------------------------------------------------------------
 * Módulo 4: Sistema de Reseñas.
 * Publicación, edición y consulta de calificaciones (1-5 estrellas),
 * almacenadas en MongoDB. Generalizado para soportar tanto Place como
 * Hotel (ver models/mongodb/Review.js). Cada cambio recalcula el
 * promedio denormalizado (ratingAvg / ratingCount) en el documento
 * correspondiente (Place u Hotel), para que la App Móvil y el Smartwatch
 * puedan leer la calificación sin necesidad de agregar sobre la
 * colección de reseñas en cada consulta.
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const Review = require('../models/mongodb/Review');
const Place = require('../models/mongodb/Place');
const Hotel = require('../models/mongodb/Hotel');
const ActivityLog = require('../models/mongodb/ActivityLog');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

const ENTITY_MODELS = { place: Place, hotel: Hotel };

/**
 * Recalcula ratingAvg y ratingCount de una entidad (Place u Hotel) a
 * partir de sus reseñas.
 */
const recalculateEntityRating = async (entityType, entityId) => {
  const EntityModel = ENTITY_MODELS[entityType];
  if (!EntityModel) return;

  const stats = await Review.aggregate([
    { $match: { entityType, entityId: new mongoose.Types.ObjectId(entityId) } },
    { $group: { _id: '$entityId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};

  await EntityModel.findByIdAndUpdate(entityId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

/**
 * GET /reviews?entityType=&entityId=
 * Público: cualquiera puede consultar las reseñas de un lugar u hotel.
 */
const listReviews = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 50);

    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

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
 * Crea una reseña de un Place o un Hotel. Un usuario solo puede reseñar
 * una misma entidad una vez (si ya existe, se recomienda usar
 * PUT /reviews/:id para editarla).
 */
const createReview = async (req, res, next) => {
  try {
    const { entityType, entityId, entityName, rating, comment, photos, tags } = req.body;

    const EntityModel = ENTITY_MODELS[entityType];
    if (!EntityModel) {
      throw new AppError('entityType inválido. Debe ser "place" u "hotel".', 422);
    }

    const entity = await EntityModel.findById(entityId);
    if (!entity) {
      throw new AppError('La entidad reseñada no existe.', 404);
    }

    const existing = await Review.findOne({ entityType, entityId, userId: req.user.id });
    if (existing) {
      throw new AppError('Ya has calificado esta entidad. Edita tu reseña existente.', 409);
    }

    const review = await Review.create({
      userId: req.user.id,
      entityType,
      entityId,
      entityName: entityName || entity.name,
      rating,
      comment,
      photos,
      tags,
    });

    await recalculateEntityRating(entityType, entityId);

    ActivityLog.create({
      userId: req.user.id,
      eventType: 'write_review',
      entityType,
      entityId,
      metadata: { rating },
      source: req.headers['x-client-platform'] || 'mobile',
    }).catch(() => {});

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
    await recalculateEntityRating(review.entityType, review.entityId);

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

    const { entityType, entityId } = review;
    await review.deleteOne();
    await recalculateEntityRating(entityType, entityId);

    return ApiResponse.success(res, 200, 'Reseña eliminada.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listReviews, createReview, updateReview, deleteReview };
