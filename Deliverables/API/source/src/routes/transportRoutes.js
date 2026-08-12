/**
 * routes/transportRoutes.js
 * -----------------------------------------------------------------------
 * CRUD de rutas de transporte: lectura pública, escritura restringida a
 * administradores.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const transportController = require('../controllers/transportController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const fareClassesValidator = [
  body('fareClasses').optional().isArray().withMessage('fareClasses debe ser un arreglo.'),
  body('fareClasses.*.name').optional().isString().notEmpty(),
  body('fareClasses.*.price').optional().isFloat({ min: 0 }),
  body('fareClasses.*.occupancyPct').optional().isInt({ min: 0, max: 100 }),
];

router.get(
  '/',
  [
    query('origin').optional().isString(),
    query('destination').optional().isString(),
    query('day').optional().isIn(['L', 'M', 'X', 'J', 'V', 'S', 'D']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  transportController.listRoutes
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Identificador de ruta inválido.')],
  validateRequest,
  transportController.getRoute
);

router.post(
  '/',
  protect,
  authorize('administrador'),
  [
    body('company').trim().notEmpty().withMessage('La compañía es obligatoria.'),
    body('origin').trim().notEmpty().withMessage('El origen es obligatorio.'),
    body('destination').trim().notEmpty().withMessage('El destino es obligatorio.'),
    body('departureTime').notEmpty().withMessage('La hora de salida es obligatoria.'),
    body('arrivalTime').notEmpty().withMessage('La hora de llegada es obligatoria.'),
    body('capacity').isInt({ min: 1 }).withMessage('La capacidad debe ser mayor a 0.'),
    body('daysOfWeek').optional().isArray(),
    ...fareClassesValidator,
  ],
  validateRequest,
  transportController.createRoute
);

router.put(
  '/:id',
  protect,
  authorize('administrador'),
  [param('id').isInt().withMessage('Identificador de ruta inválido.'), ...fareClassesValidator],
  validateRequest,
  transportController.updateRoute
);

router.delete(
  '/:id',
  protect,
  authorize('administrador'),
  [param('id').isInt().withMessage('Identificador de ruta inválido.')],
  validateRequest,
  transportController.deleteRoute
);

module.exports = router;
