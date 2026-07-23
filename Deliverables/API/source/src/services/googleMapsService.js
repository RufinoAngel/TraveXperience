/**
 * services/googleMapsService.js
 * -----------------------------------------------------------------------
 * Integración con Google Maps Platform (Geocoding API + Places API).
 * Se reutiliza en varios lugares:
 *   1) mapsController -> GET /maps/geocode (autocompletado en formularios de admin).
 *   2) localTourismController / hotelController -> al registrar un
 *      Place/Hotel sin coordenadas (geocode) o sin foto (Places Photos).
 *   3) weatherController -> GET /weather?destination= (convierte texto a lat/lng).
 *
 * NOTA sobre fotos: la Places Photo API de Google exige incrustar la API
 * key en la URL de la imagen. Para no exponerla en el navegador, el flujo
 * correcto es: 1) el backend busca el "photo_reference" una sola vez al
 * crear el lugar, 2) el frontend consume la imagen a través de nuestro
 * propio proxy (GET /maps/photo?ref=...), que es quien realmente llama a
 * Google con la key guardada del lado del servidor.
 * -----------------------------------------------------------------------
 */

const logger = require('../utils/logger');

const GEOCODE_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const FIND_PLACE_BASE_URL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
const PLACE_PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';
const REQUEST_TIMEOUT_MS = 8000;

const getApiKey = () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY no está configurada.');
  }
  return apiKey;
};

/**
 * Geocodifica una dirección de texto a coordenadas.
 * Lanza un Error simple (no AppError); el controlador decide el status HTTP.
 * Los errores de "dirección no encontrada" se marcan con error.code = 'NOT_FOUND'
 * para que el controlador pueda distinguirlos de una falla del servicio.
 * @param {string} address
 * @returns {Promise<{lat:number, lng:number, formattedAddress:string}>}
 */
const geocodeAddress = async (address) => {
  if (!address || !String(address).trim()) {
    throw new Error('Se requiere una dirección para geocodificar.');
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY no está configurada.');
  }

  const url = new URL(GEOCODE_BASE_URL);
  url.searchParams.set('address', address);
  url.searchParams.set('key', apiKey);

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (networkError) {
    logger.error(`Error de red al consultar Google Maps Geocoding: ${networkError.message}`);
    throw new Error('No se pudo contactar al servicio de geocodificación.');
  }

  if (!response.ok) {
    logger.warn(`Google Maps Geocoding respondió HTTP ${response.status}.`);
    throw new Error('El servicio de geocodificación no respondió correctamente.');
  }

  const raw = await response.json();

  if (raw.status === 'ZERO_RESULTS') {
    const notFoundError = new Error('No se encontraron coordenadas para la dirección proporcionada.');
    notFoundError.code = 'NOT_FOUND';
    throw notFoundError;
  }

  if (raw.status !== 'OK' || !raw.results || !raw.results.length) {
    logger.warn(`Google Maps Geocoding devolvió status "${raw.status}".`);
    throw new Error('El servicio de geocodificación no pudo procesar la dirección.');
  }

  const result = raw.results[0];

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
};

/**
 * Busca un lugar por texto (nombre + dirección/municipio) en Google Places
 * y devuelve la referencia de su primera foto disponible, si existe.
 * No lanza error si Google simplemente no tiene el lugar o no tiene fotos
 * (caso normal para negocios pequeños/locales) — devuelve null.
 * @param {string} query ej. "Cascada de Patla, Xicotepec, Puebla"
 * @returns {Promise<string|null>} photo_reference de Google, o null
 */
const findPlacePhotoReference = async (query) => {
  if (!query || !String(query).trim()) return null;

  let apiKey;
  try {
    apiKey = getApiKey();
  } catch {
    return null; // sin key configurada, simplemente no hay foto automática
  }

  const url = new URL(FIND_PLACE_BASE_URL);
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id,photos');
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) {
      logger.warn(`Google Places (Find Place) respondió HTTP ${response.status}.`);
      return null;
    }

    const raw = await response.json();
    const candidate = raw.candidates?.[0];
    const photoReference = candidate?.photos?.[0]?.photo_reference;

    return photoReference || null;
  } catch (error) {
    logger.warn(`No se pudo buscar foto automática en Google Places: ${error.message}`);
    return null;
  }
};

/**
 * Descarga los bytes de una foto de Google Places usando su photo_reference.
 * Se usa SOLO del lado del servidor (mapsController), para que la API key
 * nunca llegue al navegador del usuario.
 * @param {string} photoReference
 * @param {number} maxWidth
 * @returns {Promise<{buffer: Buffer, contentType: string}>}
 */
const fetchPlacePhoto = async (photoReference, maxWidth = 800) => {
  if (!photoReference) {
    throw new Error('Se requiere un photoReference.');
  }

  const apiKey = getApiKey();

  const url = new URL(PLACE_PHOTO_BASE_URL);
  url.searchParams.set('photo_reference', photoReference);
  url.searchParams.set('maxwidth', Math.min(Math.max(Number(maxWidth) || 800, 100), 1600));
  url.searchParams.set('key', apiKey);

  let response;
  try {
    // fetch sigue automáticamente el 302 que regresa este endpoint hacia el CDN real de Google.
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (networkError) {
    logger.error(`Error de red al descargar foto de Google Places: ${networkError.message}`);
    throw new Error('No se pudo contactar al servicio de fotos de Google Maps.');
  }

  if (!response.ok) {
    const notFoundError = new Error('No se pudo obtener la foto solicitada (referencia inválida o vencida).');
    notFoundError.code = 'NOT_FOUND';
    throw notFoundError;
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get('content-type') || 'image/jpeg',
  };
};

/**
 * Construye la URL pública (a través de nuestro propio proxy) para una
 * foto ya localizada con findPlacePhotoReference. `apiBaseUrl` debe ser la
 * URL base de la API (ej. "http://localhost:4000/api/v1" o el dominio real
 * en producción), SIN slash final.
 */
const buildPhotoProxyUrl = (apiBaseUrl, photoReference) =>
  `${apiBaseUrl}/maps/photo?ref=${encodeURIComponent(photoReference)}`;

/**
 * Genera una imagen de respaldo local en formato data URL para que el
 * frontend siempre tenga una imagen visible sin depender de servicios
 * externos como Unsplash o Google Places.
 */
const buildFallbackImageUrl = (query, width = 1200, height = 800) => {
  const safeQuery = String(query || 'turismo puebla').trim() || 'turismo puebla';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#1f6f4a"/>
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="#2b8a5b"/>
      <circle cx="${width * 0.35}" cy="${height * 0.38}" r="90" fill="#f0c96b"/>
      <path d="M220 620c60-120 180-180 300-180s240 60 300 180" fill="#f7f3e8"/>
      <text x="50%" y="78%" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="white">${safeQuery}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

module.exports = {
  geocodeAddress,
  findPlacePhotoReference,
  fetchPlacePhoto,
  buildPhotoProxyUrl,
  buildFallbackImageUrl,
};
