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
 * Construye la URL pública para cualquier tipo de imagen soportado:
 * - rutas locales del backend (ej. /uploads/profiles/avatar.jpeg)
 * - URLs externas absolutas (http:// o https://)
 * - referencias de Google Places (photo_reference)
 *
 * `apiBaseUrl` puede llegar como la raíz pública del backend
 * (ej. "http://localhost:4000") o como la base de la API
 * (ej. "http://localhost:4000/api/v1"). La función normaliza ambos casos
 * para evitar que una imagen local termine siendo servida bajo /api/v1.
 */
const buildPhotoProxyUrl = (apiBaseUrl, photoReference) => {
  if (!photoReference) return null;

  const normalizedBaseUrl = String(apiBaseUrl || '').replace(/\/+$/, '');
  const publicBaseUrl = normalizedBaseUrl.endsWith('/api/v1')
    ? normalizedBaseUrl.replace(/\/api\/v1$/, '')
    : normalizedBaseUrl;
  const apiBaseUrlWithVersion = normalizedBaseUrl.endsWith('/api/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api/v1`;

  // Si es una imagen local, servirla directamente desde la raíz del backend.
  if (photoReference.startsWith('/uploads')) {
    return `${publicBaseUrl}${photoReference}`;
  }

  // Si es una URL completa, usarla tal cual.
  if (
    photoReference.startsWith('http://') ||
    photoReference.startsWith('https://')
  ) {
    return photoReference;
  }

  // Si es una referencia de Google Places, usar el proxy interno.
  return `${apiBaseUrlWithVersion}/maps/photo?ref=${encodeURIComponent(photoReference)}`;
};

/**
 * Genera una imagen de respaldo para que el frontend siempre tenga algo
 * visible cuando Google Places no tiene foto de un lugar.
 *
 * OJO: antes esto devolvía un data URI de SVG
 * (data:image/svg+xml;charset=UTF-8,...). Se veía bien en el navegador
 * (el <img> del front web decodifica SVG sin problema), pero el
 * componente <Image> de React Native NO soporta SVG — sus decodificadores
 * nativos (iOS/Android) solo entienden formatos raster (PNG/JPEG/GIF/WebP),
 * así que en la app móvil esas imágenes simplemente no cargaban
 * ("unknown image format"). Por eso ahora se genera un PNG real.
 */
const buildFallbackImageUrl = (query, width = 1200, height = 800) => {
  const safeQuery = String(query || 'turismo puebla').trim() || 'turismo puebla';
  const params = new URLSearchParams({ text: safeQuery });
  // Mismos colores del diseño anterior (verde de fondo, texto claro).
  return `https://placehold.co/${width}x${height}/1f6f4a/f7f3e8.png?${params.toString()}`;
};

module.exports = {
  geocodeAddress,
  findPlacePhotoReference,
  fetchPlacePhoto,
  buildPhotoProxyUrl,
  buildFallbackImageUrl,
};
