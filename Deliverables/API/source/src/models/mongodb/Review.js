/**
 * models/mongodb/Review.js
 * -----------------------------------------------------------------------
 * Esquema Mongoose para reseñas (1-5 estrellas). Generalizado para
 * soportar tanto Place como Hotel (antes solo aceptaba placeId), por la
 * misma razón que Favorite: el filtrado colaborativo (SVD), el análisis
 * de sentimiento y la segmentación por experiencia necesitan reviews de
 * ambos tipos de entidad en la misma matriz usuario-entidad.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const ENTITY_TYPES = ['place', 'hotel'];
const ENTITY_MODEL_MAP = { place: 'Place', hotel: 'Hotel' };

const reviewSchema = new Schema(
  {
    // Referencia al usuario en MySQL (no es una FK real, es un ID puente)
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
      required: true,
    },
    entityModel: {
      type: String,
      enum: Object.values(ENTITY_MODEL_MAP),
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityModel',
    },
    // Denormalizado a propósito (evita un populate solo para mostrar el
    // nombre en listados de reseñas del usuario).
    entityName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    photos: [{ type: String }], // URLs de imágenes subidas
    tags: [{ type: String }], // ej. ["familiar", "económico", "vista"]
  },
  { timestamps: true }
);

reviewSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
// Un usuario solo puede reseñar una misma entidad una vez.
reviewSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

reviewSchema.pre('validate', function setEntityModel(next) {
  if (this.entityType && !this.entityModel) {
    this.entityModel = ENTITY_MODEL_MAP[this.entityType];
  }
  next();
});

const ReviewModel = model('Review', reviewSchema);
ReviewModel.ENTITY_TYPES = ENTITY_TYPES;
ReviewModel.ENTITY_MODEL_MAP = ENTITY_MODEL_MAP;

module.exports = ReviewModel;
