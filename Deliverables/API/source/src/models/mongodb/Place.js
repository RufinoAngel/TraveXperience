/**
 * models/mongodb/Place.js
 * -----------------------------------------------------------------------
 * Catálogo de lugares turísticos (playas, sitios culturales, hoteles,
 * restaurantes, eventos). Es la fuente principal de datos para:
 *   - Módulo 2 (Turismo Local / "Cerca de Mí") en la App Móvil.
 *   - Módulo 5 (Wearable) para notificaciones de lugares cercanos.
 *
 * Usa un índice geoespacial 2dsphere sobre `location` para resolver
 * consultas de proximidad ($nearSphere / $geoNear) de forma eficiente,
 * tal como requiere el Smartwatch (mini mapa + notificación instantánea).
 * -----------------------------------------------------------------------
 */

const { Schema, model } = require('mongoose');

const CATEGORIES = [
  'playa',
  'sitio_cultural',
  'hotel',
  'restaurante',
  'evento',
  'entretenimiento',
  'naturaleza',
];

const placeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 800,
    },
    address: {
      type: String,
    },
    municipality: {
      // ej. "Xicotepec", "Sierra Norte de Puebla" — permite acotar el catálogo del piloto
      type: String,
      default: 'Xicotepec',
      index: true,
    },
    // Formato GeoJSON requerido por MongoDB para consultas geoespaciales
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        // [longitud, latitud] — OJO: MongoDB usa [lng, lat], no [lat, lng]
        type: [Number],
        required: true,
      },
    },
    images: [{ type: String }],
    // Referencia cruda de Google Places (si la foto se auto-asignó al crear
    // el lugar). Las URLs públicas ya resueltas van en `images`; este campo
    // solo se guarda por si en el futuro se necesita refrescar/regenerar la foto.
    photoReference: {
      type: String,
    },
    // true cuando `location` ya fue contrastada contra un match real de
    // Google Places (ver scripts/seedPlaces.js -> refineLocationsWithGoogle).
    // Evita volver a gastar cuota / arriesgar un mal match en corridas
    // posteriores del script, y permite que un admin marque manualmente
    // como verificada una coordenada corregida a mano.
    locationVerified: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String }], // ej. ["familiar", "vista", "económico"]
    priceLevel: {
      type: Number,
      min: 1,
      max: 4, // 1 = económico ... 4 = alto costo
      default: 1,
    },
    // Denormalizado desde el módulo de reseñas para lecturas rápidas
    // (evita hacer join/aggregate contra la colección Review en cada consulta de "cerca de mí")
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

placeSchema.index({ location: '2dsphere' });

module.exports = model('Place', placeSchema);
module.exports.CATEGORIES = CATEGORIES;
