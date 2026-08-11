/**
 * routes/presenceRoutes.js
 * -----------------------------------------------------------------------
 * "N personas viendo esto ahora mismo", vía heartbeat + polling.
 * Público (optionalAuth): no requiere login, funciona también para
 * usuarios anónimos explorando el catálogo, pero si vienen logueados se
 * guarda el userId por si se necesita más adelante (ej. deduplicar por
 * usuario en vez de por sesión).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const presenceController = require('../controllers/presenceController');
const { optionalAuth } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const ENTITY_TYPES = ['place', 'hotel'];

router.post(
  '/heartbeat',
  optionalAuth,
  [
    body('entityType').isIn(ENTITY_TYPES).withMessage('entityType debe ser "place" u "hotel".'),
    body('entityId').isMongoId().withMessage('entityId inválido.'),
    body('sessionId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('sessionId es requerido.'),
  ],
  validateRequest,
  presenceController.heartbeat
);

router.get(
  '/',
  optionalAuth,
  [
    query('entityType').isIn(ENTITY_TYPES).withMessage('entityType debe ser "place" u "hotel".'),
    query('entityId').isMongoId().withMessage('entityId inválido.'),
  ],
  validateRequest,
  presenceController.getPresence
);

router.post('/leave', presenceController.leave);

module.exports = router;

