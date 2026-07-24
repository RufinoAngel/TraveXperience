/**
 * models/mongodb/Hotel.js
 * -----------------------------------------------------------------------
 * Catálogo específico de hoteles registrados por administradores, con
 * habitaciones (rooms) y amenidades — más rico que el `Place` genérico,
 * que solo alcanza para un pin en el mapa. Se usa desde
 * Admin/registroHotel.jsx e Admin/inventario.jsx en el frontend.
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const roomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // ej. "Suite Doble"
    details: { type: String, trim: true, maxlength: 300 },
    pricePerNight: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      // libre a propósito (Boutique, Todo incluido, Hostal...), a diferencia
      // del enum cerrado de Place.category
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 800,
    },
    address: {
      type: String,
    },
    municipality: {
      type: String,
      default: 'Xicotepec',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        // [longitud, latitud]
        type: [Number],
        required: true,
      },
    },
    mainImage: {
      type: String,
    },
    images: [{ type: String }],
    // Referencia cruda de Google Places (si la foto se auto-asignó al crear
    // el hotel). Las URLs públicas ya resueltas van en `images`/`mainImage`.
    photoReference: {
      type: String,
    },
    amenities: [{ type: String }], // ej. wifi, alberca, desayuno, estacionamiento
    rooms: [roomSchema],
    // Puente lógico al id numérico de users (MySQL) — el administrador dueño del hotel
    ownerId: {
      type: Number,
      required: true,
      index: true,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

hotelSchema.index({ location: '2dsphere' });

/** Precio desde: el más barato entre las habitaciones activas, para tarjetas de listado. */
hotelSchema.virtual('startingPrice').get(function getStartingPrice() {
  if (!this.rooms || this.rooms.length === 0) return null;
  return Math.min(...this.rooms.map((r) => r.pricePerNight));
});

hotelSchema.set('toJSON', { virtuals: true });
hotelSchema.set('toObject', { virtuals: true });

module.exports = model('Hotel', hotelSchema);
