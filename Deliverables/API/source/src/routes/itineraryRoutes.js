/**
 * routes/itineraryRoutes.js
 * -----------------------------------------------------------------------
 * Módulo 3: Turismo Foráneo ("Fuera de Casa") — CRUD, Plataforma Web.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const itineraryValidators = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio.'),
  body('destination').trim().notEmpty().withMessage('El destino es obligatorio.'),
  body('startDate').isISO8601().withMessage('startDate debe ser una fecha válida (YYYY-MM-DD).'),
  body('endDate').isISO8601().withMessage('endDate debe ser una fecha válida (YYYY-MM-DD).'),
  body('estimatedBudget').optional().isFloat({ min: 0 }),
  body('itineraryDetails').optional().isArray(),
];

router
  .route('/')
  .get(protect, itineraryController.listItineraries)
  .post(protect, itineraryValidators, validateRequest, itineraryController.createItinerary);

router
  .route('/:id')
  .get(
    protect,
    [param('id').isInt().withMessage('Identificador inválido.')],
    validateRequest,
    itineraryController.getItinerary
  )
  .put(
    protect,
    [param('id').isInt().withMessage('Identificador inválido.')],
    validateRequest,
    itineraryController.updateItinerary
  )
  .delete(
    protect,
    [param('id').isInt().withMessage('Identificador inválido.')],
    validateRequest,
    itineraryController.deleteItinerary
  );

module.exports = router;
