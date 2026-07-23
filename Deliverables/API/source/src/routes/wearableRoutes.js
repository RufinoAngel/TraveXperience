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

module.exports = router;
