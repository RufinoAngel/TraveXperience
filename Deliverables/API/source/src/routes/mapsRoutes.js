/**
 * routes/mapsRoutes.js
 * -----------------------------------------------------------------------
 * Módulo Google Maps Platform (Geocoding API).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const mapsController = require('../controllers/mapsController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.get(
  '/geocode',
  protect,
  authorize('administrador'),
  [
    query('address')
      .trim()
      .notEmpty()
      .withMessage('Se requiere el parámetro "address".')
      .isLength({ max: 300 })
      .withMessage('La dirección es demasiado larga.'),
  ],
  validateRequest,
  mapsController.geocode
);

// Pública (sin JWT): es una imagen que se renderiza directo en <img src="...">,
// igual que cualquier otro asset estático de la app.
router.get(
  '/photo',
  [
    query('ref').trim().notEmpty().withMessage('Se requiere el parámetro "ref".'),
    query('maxwidth').optional().isInt({ min: 100, max: 1600 }),
  ],
  validateRequest,
  mapsController.getPlacePhoto
);

module.exports = router;
