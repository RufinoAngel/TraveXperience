/**
 * controllers/wearableController.js
 * -----------------------------------------------------------------------
 * Módulo 5: Interconexión Wearable (Wear OS / Kotlin).
 *
 * Principio de diseño: el Smartwatch tiene pantalla pequeña, batería
 * limitada y conectividad intermitente (a menudo depende del Bluetooth
 * con el teléfono). Por eso TODOS los endpoints de este controlador:
 *   - devuelven payloads mínimos (solo los campos que se renderizan),
 *   - evitan cómputo pesado,
 *   - reutilizan el mismo JWT emitido por el teléfono (login compartido).
 *
 * Cubre exactamente lo descrito en el Canvas para "Smartwatch (Wear OS)":
 *   1. Obtiene la ubicación del usuario en tiempo real desde el reloj.
 *   2. Muestra un mini mapa con la posición actual y puntos de interés.
 *   3. Notifica lugares cercanos al instante, sin sacar el celular.
 * -----------------------------------------------------------------------
 */

const Itinerary = require('../models/mysql/Itinerary');
const ActivityLog = require('../models/mongodb/ActivityLog');
const geoService = require('../services/geoService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

// Radio reducido por defecto: en el reloj interesan solo lugares
// realmente cercanos y accesibles a pie durante el recorrido.
const WATCH_DEFAULT_RADIUS_METERS = 1500;
const WATCH_MAX_RESULTS = 8;

// Distancia a partir de la cual un lugar dispara una "notificación instantánea"
const ALERT_RADIUS_METERS = 300;
const ALERT_MIN_RATING = 4;

/**
 * Reduce un documento Place al payload mínimo que necesita el reloj:
 * nombre, categoría, coordenadas (para el mini mapa) y distancia.
 */
const toWatchPayload = (place, lat, lng) => ({
  id: place._id,
  name: place.name,
  category: place.category,
  lat: place.location.coordinates[1],
  lng: place.location.coordinates[0],
  distanceMeters: geoService.haversineDistanceMeters(
    Number(lat),
    Number(lng),
    place.location.coordinates[1],
    place.location.coordinates[0]
  ),
  ratingAvg: place.ratingAvg,
});

/**
 * GET /wearable/nearby
 * Query: lat, lng, radius? (m), category?
 * Mini mapa de referencia con posición actual + puntos de interés cercanos.
 */
const getNearbyLight = async (req, res, next) => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (lat === undefined || lng === undefined) {
      throw new AppError('Se requieren los parámetros "lat" y "lng".', 400);
    }

    let places;
    try {
      ({ places } = await geoService.findNearbyPlaces({
        lat,
        lng,
        radius: radius || WATCH_DEFAULT_RADIUS_METERS,
        category,
        limit: WATCH_MAX_RESULTS,
      }));
    } catch (geoError) {
      throw new AppError(geoError.message, 400);
    }

    const lightPlaces = places
      .map((p) => toWatchPayload(p, lat, lng))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return ApiResponse.success(res, 200, 'Puntos de interés cercanos.', {
      userLocation: { lat: Number(lat), lng: Number(lng) },
      places: lightPlaces,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /wearable/location
 * Body: { lat, lng }
 * Recibe la ubicación en tiempo real emitida por el reloj, la registra
 * como evento de actividad (fuente = smartwatch, alimenta el modelo de
 * ML) y responde de inmediato con cualquier lugar "digno de alerta"
 * (muy cercano y bien calificado) para notificación instantánea.
 */
const syncLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      throw new AppError('Se requieren "lat" y "lng" en el cuerpo de la petición.', 400);
    }

    // Log no bloqueante: no debe retrasar la respuesta al reloj.
    ActivityLog.create({
      userId: req.user.id,
      eventType: 'wearable_sync',
      source: 'smartwatch',
      metadata: { lat: Number(lat), lng: Number(lng) },
    }).catch(() => {});

    let places = [];
    try {
      ({ places } = await geoService.findNearbyPlaces({
        lat,
        lng,
        radius: ALERT_RADIUS_METERS,
        limit: 5,
      }));
    } catch {
      places = [];
    }

    const alerts = places
      .filter((p) => (p.ratingAvg || 0) >= ALERT_MIN_RATING)
      .map((p) => toWatchPayload(p, lat, lng));

    return ApiResponse.success(res, 200, 'Ubicación sincronizada.', {
      hasAlert: alerts.length > 0,
      alerts,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /wearable/alerts?lat=&lng=
 * Variante idempotente de syncLocation, útil cuando el reloj solo quiere
 * refrescar notificaciones sin registrar un nuevo evento de tracking.
 */
const getAlerts = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (lat === undefined || lng === undefined) {
      throw new AppError('Se requieren los parámetros "lat" y "lng".', 400);
    }

    const { places } = await geoService.findNearbyPlaces({
      lat,
      lng,
      radius: ALERT_RADIUS_METERS,
      limit: 5,
    });

    const alerts = places
      .filter((p) => (p.ratingAvg || 0) >= ALERT_MIN_RATING)
      .map((p) => toWatchPayload(p, lat, lng));

    return ApiResponse.success(res, 200, 'Alertas obtenidas.', { hasAlert: alerts.length > 0, alerts });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /wearable/itinerary/active
 * Devuelve SOLO el itinerario en curso (si existe), con los campos
 * mínimos: título, destino y las actividades de hoy. Así el reloj evita
 * cargar y parsear el objeto completo del itinerario (potencialmente
 * pesado en la Plataforma Web).
 */
const getActiveItinerary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const itinerary = await Itinerary.findOne({
      where: { userId: req.user.id },
      order: [['startDate', 'DESC']],
    });

    // Se filtra en memoria por rango de fechas + estado, ya que Sequelize
    // con operadores Op.lte/Op.gte requeriría importar Op solo para esto;
    // dado el bajo volumen de itinerarios por usuario, es aceptable.
    const active =
      itinerary &&
      itinerary.startDate <= today &&
      itinerary.endDate >= today &&
      ['confirmado', 'en_curso'].includes(itinerary.status);

    if (!active) {
      return ApiResponse.success(res, 200, 'No hay itinerario activo.', { itinerary: null });
    }

    const todaysDetails = Array.isArray(itinerary.itineraryDetails)
      ? itinerary.itineraryDetails.filter((day) => day.date === today)
      : [];

    return ApiResponse.success(res, 200, 'Itinerario activo obtenido.', {
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        destination: itinerary.destination,
        today: todaysDetails,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNearbyLight, syncLocation, getAlerts, getActiveItinerary };
