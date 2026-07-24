/**
 * services/geoService.js
 * -----------------------------------------------------------------------
 * Encapsula las consultas geoespaciales sobre el catálogo de lugares
 * (Place). Se reutiliza tanto en el Módulo 2 (App Móvil, payload
 * completo) como en el Módulo 5 (Smartwatch, payload ligero), evitando
 * duplicar la lógica de proximidad en dos controladores distintos.
 * -----------------------------------------------------------------------
 */

const Place = require('../models/mongodb/Place');

const DEFAULT_RADIUS_METERS = 5000;
const MAX_RADIUS_METERS = 50000;

/**
 * Ejecuta una búsqueda $nearSphere sobre la colección Place.
 * @param {{lat:number, lng:number, radius?:number, category?:string, limit?:number}} params
 */
const findNearbyPlaces = async ({ lat, lng, radius, category, limit }) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const maxDistance = Math.min(Number(radius) || DEFAULT_RADIUS_METERS, MAX_RADIUS_METERS);
  const resultLimit = Math.min(Number(limit) || 20, 50);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Coordenadas inválidas.');
  }

  const query = {
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
  };

  if (category) query.category = category;

  return { places: await Place.find(query).limit(resultLimit).lean(), maxDistance };
};

/**
 * Calcula distancia aproximada (metros) entre dos puntos usando Haversine.
 * Útil para anotar `distanceMeters` en payloads ligeros del wearable.
 */
const haversineDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // radio de la Tierra en metros
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
};

module.exports = { findNearbyPlaces, haversineDistanceMeters, DEFAULT_RADIUS_METERS };
