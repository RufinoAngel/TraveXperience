/**
 * models/mongodb/Favorite.js
 * -----------------------------------------------------------------------
 * Lugares (Place) guardados como favoritos por un usuario. Puente lógico
 * hacia el id numérico de `users` en MySQL, igual que Review/ActivityLog.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const favoriteSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    placeId: {
      type: Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },
  },
  { timestamps: true }
);

// Evita que un mismo usuario guarde el mismo lugar dos veces
favoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

module.exports = model('Favorite', favoriteSchema);
