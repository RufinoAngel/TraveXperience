/**
 * routes/weatherRoutes.js
 * -----------------------------------------------------------------------
 * Módulo Clima (OpenWeatherMap).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const weatherController = require('../controllers/weatherController');
const validateRequest = require('../middlewares/validateRequest');

router.get(
  '/',
  [
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
    query('destination')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('El destino debe tener entre 2 y 200 caracteres.'),
  ],
  validateRequest,
  weatherController.getWeather
);

module.exports = router;
