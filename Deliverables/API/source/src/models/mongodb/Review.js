/**
 * models/mongodb/Review.js
 * -----------------------------------------------------------------------
 * Esquema Mongoose para reseñas de lugares/itinerarios (1-5 estrellas).
 * Se usa MongoDB por el alto volumen de escritura y la estructura semi
 * variable del contenido (texto libre, fotos, tags dinámicos).
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    // Referencia al usuario en MySQL (no es una FK real, es un ID puente)
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    placeId: {
      type: String,
      required: true,
      index: true,
    },
    placeName: {
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

reviewSchema.index({ placeId: 1, createdAt: -1 });

module.exports = model('Review', reviewSchema);
