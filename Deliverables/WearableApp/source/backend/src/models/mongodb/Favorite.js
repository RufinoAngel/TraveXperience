/**
 * models/mongodb/Favorite.js
 * -----------------------------------------------------------------------
 * Entidades guardadas como favoritas por un usuario. Generalizado para
 * soportar tanto Place como Hotel (antes solo aceptaba placeId), porque
 * varios de los mecanismos de ML propuestos (filtrado colaborativo,
 * reglas de asociación, comunidades de usuarios) necesitan favoritos
 * mixtos de ambos tipos en la misma colección.
 *
 * `entityId` usa `refPath` para poblar dinámicamente contra el modelo
 * correcto (Place u Hotel) según el valor de `entityType`.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const ENTITY_TYPES = ['place', 'hotel'];

// Mapa de entityType -> nombre del modelo Mongoose (usado por refPath)
const ENTITY_MODEL_MAP = { place: 'Place', hotel: 'Hotel' };

const favoriteSchema = new Schema(
  {
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
    // Nombre del modelo al que apunta entityId, derivado de entityType.
    // Se guarda explícito (en vez de calcularlo solo en refPath) para que
    // agregaciones/consultas de Mongo puedan usarlo directo sin lógica JS.
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
  },
  { timestamps: true }
);

// Evita que un mismo usuario guarde la misma entidad dos veces
favoriteSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

// Autocompleta entityModel a partir de entityType antes de validar/guardar,
// para que quien llame a Favorite.create({..}) no tenga que repetirlo.
favoriteSchema.pre('validate', function setEntityModel(next) {
  if (this.entityType && !this.entityModel) {
    this.entityModel = ENTITY_MODEL_MAP[this.entityType];
  }
  next();
});

const FavoriteModel = model('Favorite', favoriteSchema);
FavoriteModel.ENTITY_TYPES = ENTITY_TYPES;
FavoriteModel.ENTITY_MODEL_MAP = ENTITY_MODEL_MAP;

module.exports = FavoriteModel;
