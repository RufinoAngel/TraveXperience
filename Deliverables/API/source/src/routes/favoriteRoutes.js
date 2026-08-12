/**
 * routes/favoriteRoutes.js
 * -----------------------------------------------------------------------
 * Favoritos del usuario autenticado. Soporta tanto Place como Hotel.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const ENTITY_TYPES = ['place', 'hotel'];

router.get(
  '/',
  protect,
  [query('entityType').optional().isIn(ENTITY_TYPES).withMessage('entityType inválido.')],
  validateRequest,
  favoriteController.listFavorites
);

router.post(
  '/',
  protect,
  [
    body('entityType').isIn(ENTITY_TYPES).withMessage('entityType debe ser "place" u "hotel".'),
    body('entityId').isMongoId().withMessage('entityId inválido.'),
  ],
  validateRequest,
  favoriteController.addFavorite
);

router.delete(
  '/:entityId',
  protect,
  [
    param('entityId').isMongoId().withMessage('entityId inválido.'),
    query('entityType').isIn(ENTITY_TYPES).withMessage('Se requiere entityType ("place" u "hotel").'),
  ],
  validateRequest,
  favoriteController.removeFavorite
);

module.exports = router;
