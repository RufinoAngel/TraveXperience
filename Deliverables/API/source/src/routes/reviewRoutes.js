/**
 * routes/reviewRoutes.js
 * -----------------------------------------------------------------------
 * Módulo 4: Sistema de Reseñas (MongoDB). Soporta tanto Place como Hotel.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const ENTITY_TYPES = ['place', 'hotel'];

router.get(
  '/',
  [
    query('entityType').optional().isIn(ENTITY_TYPES).withMessage('entityType inválido.'),
    query('entityId').optional().isMongoId().withMessage('entityId inválido.'),
  ],
  validateRequest,
  reviewController.listReviews
);

router.post(
  '/',
  protect,
  [
    body('entityType').isIn(ENTITY_TYPES).withMessage('entityType debe ser "place" u "hotel".'),
    body('entityId').isMongoId().withMessage('entityId inválido.'),
    body('entityName').optional().isString(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser de 1 a 5.'),
    body('comment').optional().isString().isLength({ max: 1000 }),
    body('photos').optional().isArray(),
    body('tags').optional().isArray(),
  ],
  validateRequest,
  reviewController.createReview
);

router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Identificador de reseña inválido.'),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 1000 }),
  ],
  validateRequest,
  reviewController.updateReview
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identificador de reseña inválido.')],
  validateRequest,
  reviewController.deleteReview
);

module.exports = router;
