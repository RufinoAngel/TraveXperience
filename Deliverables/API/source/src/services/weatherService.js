/**
 * services/weatherService.js
 * -----------------------------------------------------------------------
 * Integración con OpenWeatherMap.
 * Usa el endpoint /forecast (en vez de /weather) porque incluye la
 * probabilidad de lluvia (pop) para el siguiente bloque de 3 horas,
 * dato que la UI de Turismo Local / Itinerarios necesita mostrar.
 *
 * Cachea la respuesta en memoria por par de coordenadas (redondeadas a
 * 2 decimales) durante CACHE_TTL_MS, para no gastar cuota de la API key
 * en cada refresco de pantalla de la App Móvil / Web.
 * -----------------------------------------------------------------------
 */

const logger = require('../utils/logger');

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const CACHE_TTL_MS = 12 * 60 * 1000; // 12 minutos
const REQUEST_TIMEOUT_MS = 8000;

// Cache en memoria: Map<"lat,lng", { data, expiresAt }>
// NOTA: vive en el proceso Node actual; si se escala a varias instancias
// cada una mantiene su propia caché (suficiente para el piloto).
const cache = new Map();

const roundCoord = (value) => Number(value).toFixed(2);

const buildCacheKey = (lat, lng) => `${roundCoord(lat)},${roundCoord(lng)}`;

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

/**
 * Transforma la respuesta cruda de OpenWeatherMap al payload mínimo que
 * necesita la UI.
 */
const mapForecastToPayload = (raw) => {
  const current = raw.list && raw.list[0];
  if (!current) {
    throw new Error('La respuesta de OpenWeatherMap no contiene pronóstico.');
  }

  return {
    location: raw.city ? raw.city.name : null,
    temperature: current.main ? current.main.temp : null,
    feelsLike: current.main ? current.main.feels_like : null,
    description: current.weather && current.weather[0] ? current.weather[0].description : null,
    icon: current.weather && current.weather[0] ? current.weather[0].icon : null,
    rainProbability: current.pop !== undefined ? Math.round(current.pop * 100) : null,
    observedAt: current.dt ? new Date(current.dt * 1000).toISOString() : null,
  };
};

/**
 * Obtiene el clima para unas coordenadas dadas, usando caché en memoria.
 * Lanza un Error simple (no AppError) si algo falla; el controlador es
 * quien decide cómo traducir eso a una respuesta HTTP.
 * @param {number|string} lat
 * @param {number|string} lng
 */
const getWeatherByCoords = async (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Coordenadas inválidas.');
  }

  const cacheKey = buildCacheKey(latitude, longitude);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY no está configurada.');
  }

  const url = new URL(OPENWEATHER_BASE_URL);
  url.searchParams.set('lat', latitude);
  url.searchParams.set('lon', longitude);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', 'es');
  url.searchParams.set('appid', apiKey);

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (networkError) {
    logger.error(`Error de red al consultar OpenWeatherMap: ${networkError.message}`);
    throw new Error('No se pudo contactar al servicio de clima.');
  }

  if (!response.ok) {
    logger.warn(`OpenWeatherMap respondió ${response.status} para [${cacheKey}].`);
    throw new Error('El servicio de clima no respondió correctamente.');
  }

  const raw = await response.json();
  const payload = mapForecastToPayload(raw);

  setCache(cacheKey, payload);

  return { ...payload, cached: false };
};

module.exports = { getWeatherByCoords };
