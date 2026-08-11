/**
 * services/googleMapsService.js
 * -----------------------------------------------------------------------
 * Integración con Google Maps Platform (Geocoding API + Places API).
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

const findPlacePhotoReference = async (query) => {
  if (!query || !String(query).trim()) return null;

  let apiKey;
  try {
    apiKey = getApiKey();
  } catch {
    return null;
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
    // DEBUG TEMPORAL: si "status" no es OK, aquí está el motivo real
    // (REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST, etc.).
    if (raw.status !== 'OK') {
      logger.warn(
        `Google Places (Find Place) status="${raw.status}" error_message="${raw.error_message || ''}"`
      );
    }
    const candidate = raw.candidates?.[0];
    const photoReference = candidate?.photos?.[0]?.photo_reference;

    return photoReference || null;
  } catch (error) {
    logger.warn(`No se pudo buscar foto automática en Google Places: ${error.message}`);
    return null;
  }
};

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
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (networkError) {
    logger.error(`Error de red al descargar foto de Google Places: ${networkError.message}`);
    throw new Error('No se pudo contactar al servicio de fotos de Google Maps.');
  }

  if (!response.ok) {
    // DEBUG TEMPORAL: logueamos el motivo real que da Google (referencia
    // vencida, key inválida, sin permiso, cuota agotada, etc.) en vez de
    // adivinar con un mensaje genérico.
    let googleErrorBody = '';
    try {
      googleErrorBody = await response.text();
    } catch {
      googleErrorBody = '(no se pudo leer el cuerpo de la respuesta)';
    }
    logger.error(
      `Google Photos respondió HTTP ${response.status} para ref="${photoReference}". Cuerpo: ${googleErrorBody}`
    );

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

const buildPhotoProxyUrl = (apiBaseUrl, photoReference) => {
  if (!photoReference) return null;

  const normalizedBaseUrl = String(apiBaseUrl || '').replace(/\/+$/, '');
  const publicBaseUrl = normalizedBaseUrl.endsWith('/api/v1')
    ? normalizedBaseUrl.replace(/\/api\/v1$/, '')
    : normalizedBaseUrl;
  const apiBaseUrlWithVersion = normalizedBaseUrl.endsWith('/api/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api/v1`;

  if (photoReference.startsWith('/uploads')) {
    return `${publicBaseUrl}${photoReference}`;
  }

  if (
    photoReference.startsWith('http://') ||
    photoReference.startsWith('https://')
  ) {
    return photoReference;
  }

  return `${apiBaseUrlWithVersion}/maps/photo?ref=${encodeURIComponent(photoReference)}`;
};

const buildFallbackImageUrl = (query, width = 1200, height = 800) => {
  const safeQuery = String(query || 'turismo puebla').trim() || 'turismo puebla';
  const params = new URLSearchParams({ text: safeQuery });
  return `https://placehold.co/${width}x${height}/1f6f4a/f7f3e8.png?${params.toString()}`;
};

module.exports = {
  geocodeAddress,
  findPlacePhotoReference,
  fetchPlacePhoto,
  buildPhotoProxyUrl,
  buildFallbackImageUrl,
};
