/**
 * routes/wearableRoutes.js
 * -----------------------------------------------------------------------
 * Módulo 5: Interconexión Wearable (Wear OS / Kotlin).
 * Endpoints ligeros y optimizados: mini mapa, notificaciones instantáneas
 * de lugares cercanos e itinerario activo del día.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const wearableController = require('../controllers/wearableController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const latLngQueryValidators = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
];

// Itinerario activo (título, destino, actividades de hoy) — carga mínima.
router.get('/itinerary/active', protect, wearableController.getActiveItinerary);

// Mini mapa de referencia: posición actual + puntos de interés cercanos.
router.get('/nearby', protect, latLngQueryValidators, validateRequest, wearableController.getNearbyLight);

// Ping de ubicación en tiempo real emitido por el reloj (dispara alertas).
router.post(
  '/location',
  protect,
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
  ],
  validateRequest,
  wearableController.syncLocation
);

// Notificaciones de lugares cercanos, sin registrar un nuevo evento de tracking.
router.get('/alerts', protect, latLngQueryValidators, validateRequest, wearableController.getAlerts);

// --- Vinculación por código (celular pide código -> reloj lo canjea) -------

// El CELULAR, ya logueado, pide un código corto para escribir en el reloj.
router.post('/pair/generate-code', protect, wearableController.generatePairingCode);

// El RELOJ canjea el código por sus propias credenciales. Sin token previo
// a propósito: es justo lo que le falta al reloj en este punto del flujo.
router.post(
  '/pair/redeem',
  [
    body('code')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('El código debe tener 6 dígitos.')
      .isNumeric()
      .withMessage('El código debe ser numérico.'),
    body('deviceName').optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  wearableController.redeemPairingCode
);

// El CELULAR consulta (polling) si ese código ya fue canjeado por el reloj.
// Respaldo del evento de socket `wearable:paired` para cuando no hay
// conexión en tiempo real disponible.
router.get('/pair/status/:code', protect, wearableController.getPairingStatus);

// --- Dispositivos vinculados -------------------------------------------

router.get('/devices', protect, wearableController.listDevices);
router.delete('/devices/:id', protect, wearableController.unlinkDevice);

module.exports = router;
