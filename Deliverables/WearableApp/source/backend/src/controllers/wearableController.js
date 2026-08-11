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

const crypto = require('crypto');
const { Op } = require('sequelize');

const Itinerary = require('../models/mysql/Itinerary');
const User = require('../models/mysql/User');
const WearablePairingCode = require('../models/mysql/WearablePairingCode');
const WearableDevice = require('../models/mysql/WearableDevice');
const ActivityLog = require('../models/mongodb/ActivityLog');
const geoService = require('../services/geoService');
const tokenService = require('../services/tokenService');
const { toPublicUser } = require('./authController');
const { getIO } = require('../sockets');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Vinculación por código (celular pide código -> reloj lo canjea):
// vive muy poco tiempo y es de un solo uso.
const PAIRING_CODE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const PAIRING_CODE_MAX_ATTEMPTS = 5;

const generateRandomCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

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

/**
 * POST /wearable/pair/generate-code
 * Se llama desde el CELULAR con su token de sesión normal. Genera un
 * código corto (6 dígitos, difícil de adivinar porque usa crypto.randomInt)
 * y lo guarda asociado al usuario con vencimiento corto (5 minutos). Si el
 * usuario ya tenía un código vigente, lo invalida primero para que nunca
 * haya más de uno activo al mismo tiempo.
 */
const generatePairingCode = async (req, res, next) => {
  try {
    const now = new Date();

    // Invalida cualquier código previo del usuario que siga vigente.
    await WearablePairingCode.update(
      { usedAt: now },
      {
        where: {
          userId: req.user.id,
          usedAt: null,
          expiresAt: { [Op.gt]: now },
        },
      }
    );

    let code;
    for (let attempt = 0; attempt < PAIRING_CODE_MAX_ATTEMPTS; attempt += 1) {
      const candidate = generateRandomCode();
      // eslint-disable-next-line no-await-in-loop
      const clash = await WearablePairingCode.findOne({
        where: { code: candidate, usedAt: null, expiresAt: { [Op.gt]: now } },
      });
      if (!clash) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      throw new AppError('No se pudo generar un código de vinculación. Intenta de nuevo.', 500);
    }

    const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS);

    await WearablePairingCode.create({
      userId: req.user.id,
      code,
      expiresAt,
    });

    return ApiResponse.success(res, 201, 'Código de vinculación generado.', { code, expiresAt });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /wearable/pair/redeem
 * Se llama desde el RELOJ, sin token previo (para eso sirve). Recibe el
 * código que el usuario transcribió y, opcionalmente, el nombre del
 * dispositivo. Si el código es válido y no ha expirado, identifica al
 * usuario dueño, emite un par de credenciales exactamente igual que en
 * el login normal, invalida el código (un solo uso) y registra el
 * dispositivo vinculado. Además avisa al celular en tiempo real por
 * socket para que no tenga que hacer polling.
 */
const redeemPairingCode = async (req, res, next) => {
  try {
    const { code, deviceName } = req.body;

    const pairing = await WearablePairingCode.findOne({
      where: { code, usedAt: null, expiresAt: { [Op.gt]: new Date() } },
      order: [['createdAt', 'DESC']],
    });

    if (!pairing) {
      throw new AppError('El código es inválido o ya expiró. Genera uno nuevo desde el celular.', 400);
    }

    const user = await User.findByPk(pairing.userId);
    if (!user || !user.isActive) {
      throw new AppError('La cuenta asociada a este código ya no está disponible.', 401);
    }

    const finalDeviceName = (deviceName && String(deviceName).trim()) || 'Wear OS';

    // Mismas credenciales que emite el login normal.
    const { accessToken, refreshToken, refreshTokenHash } = tokenService.issueTokenPair(user);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    pairing.usedAt = new Date();
    pairing.deviceName = finalDeviceName;
    await pairing.save();

    const device = await WearableDevice.create({
      userId: user.id,
      deviceName: finalDeviceName,
      lastSeenAt: new Date(),
    });

    // Notifica al celular en tiempo real que el reloj ya quedó vinculado
    // (si el socket no está conectado en ese momento, no pasa nada: el
    // celular puede seguir usando el endpoint de estado como respaldo).
    try {
      getIO()
        .to(`user:${user.id}`)
        .emit('wearable:paired', {
          deviceId: device.id,
          deviceName: device.deviceName,
          pairedAt: device.createdAt,
        });
    } catch (socketError) {
      logger.warn(`No se pudo emitir wearable:paired: ${socketError.message}`);
    }

    return ApiResponse.success(res, 200, 'Reloj vinculado exitosamente.', {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
      device: { id: device.id, deviceName: device.deviceName },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /wearable/pair/status/:code
 * Respaldo por polling (sin sockets): el CELULAR pregunta, con su token,
 * si un código que generó ya fue canjeado por el reloj y con qué nombre
 * de dispositivo.
 */
const getPairingStatus = async (req, res, next) => {
  try {
    const { code } = req.params;

    const pairing = await WearablePairingCode.findOne({
      where: { code, userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!pairing) {
      throw new AppError('No se encontró ese código de vinculación.', 404);
    }

    const paired = Boolean(pairing.usedAt);

    return ApiResponse.success(res, 200, paired ? 'El reloj ya quedó vinculado.' : 'Aún esperando al reloj.', {
      paired,
      deviceName: pairing.deviceName,
      expired: !paired && pairing.expiresAt < new Date(),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /wearable/devices
 * Lista los relojes ya vinculados a la cuenta del usuario autenticado
 * (pantalla "Dispositivos vinculados").
 */
const listDevices = async (req, res, next) => {
  try {
    const devices = await WearableDevice.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return ApiResponse.success(res, 200, 'Dispositivos vinculados obtenidos.', {
      devices: devices.map((device) => ({
        id: device.id,
        deviceName: device.deviceName,
        pairedAt: device.createdAt,
        lastSeenAt: device.lastSeenAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /wearable/devices/:id
 * Desvincula un reloj de la cuenta del usuario (botón "Desvincular
 * dispositivo"). Solo borra el registro de vinculación: dado que hoy el
 * reloj comparte el mismo refreshToken de la cuenta (no uno por
 * dispositivo), esto no revoca su sesión por sí solo; si se necesita
 * revocar acceso real habría que migrar a tokens por dispositivo.
 */
const unlinkDevice = async (req, res, next) => {
  try {
    const device = await WearableDevice.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado.', 404);
    }

    await device.destroy();

    return ApiResponse.success(res, 200, 'Dispositivo desvinculado correctamente.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNearbyLight,
  syncLocation,
  getAlerts,
  getActiveItinerary,
  generatePairingCode,
  redeemPairingCode,
  getPairingStatus,
  listDevices,
  unlinkDevice,
};
