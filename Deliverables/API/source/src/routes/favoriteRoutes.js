/**
 * routes/favoriteRoutes.js
 * -----------------------------------------------------------------------
 * Favoritos del usuario autenticado.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', protect, favoriteController.listFavorites);

router.post(
  '/',
  protect,
  [body('placeId').isMongoId().withMessage('placeId inválido.')],
  validateRequest,
  favoriteController.addFavorite
);

router.delete(
  '/:placeId',
  protect,
  [param('placeId').isMongoId().withMessage('placeId inválido.')],
  validateRequest,
  favoriteController.removeFavorite
);

module.exports = router;
