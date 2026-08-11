/**
 * routes/localTourismRoutes.js
 * -----------------------------------------------------------------------
 * Módulo 2: Turismo Local ("Cerca de Mí") — consumido por la App Móvil.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();

const localTourismController = require('../controllers/localTourismController');
const Place = require('../models/mongodb/Place');
const { protect, optionalAuth, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { placesUpload } = require('../utils/upload');

router.get(
  '/nearby',
  optionalAuth,
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
    query('radius').optional().isInt({ min: 100, max: 50000 }),
    query('category').optional().isString(),
  ],
  validateRequest,
  localTourismController.getNearbyPlaces
);

router.get('/categories', localTourismController.getCategories);

// Listado general paginado (sin lat/lng), para poblar la tabla del panel de Admin.
router.get(
  '/places',
  protect,
  authorize('administrador'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isIn(Place.CATEGORIES).withMessage('Categoría inválida.'),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
  ],
  validateRequest,
  localTourismController.listPlaces
);

router.get(
  '/places/:id',
  optionalAuth,
  [param('id').isMongoId().withMessage('Identificador de lugar inválido.')],
  validateRequest,
  localTourismController.getPlaceById
);

router.post(
  '/places',
  protect,
  authorize('administrador'),
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('category').isIn(Place.CATEGORIES).withMessage('Categoría inválida.'),
    body('description').optional().isString().isLength({ max: 800 }),
    body('address').optional().trim().isString(),
    body('municipality').optional().trim().isString(),
    body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
    body('images').optional().isArray(),
    body('tags').optional().isArray(),
    body('priceLevel').optional().isInt({ min: 1, max: 4 }),
  ],
  validateRequest,
  localTourismController.createPlace
);

router.put(
  '/places/:id',
  protect,
  authorize('administrador'),
  [
    param('id').isMongoId().withMessage('Identificador de lugar inválido.'),
    body('name').optional().trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('category').optional().isIn(Place.CATEGORIES).withMessage('Categoría inválida.'),
    body('description').optional().isString().isLength({ max: 800 }),
    body('address').optional().trim().isString(),
    body('municipality').optional().trim().isString(),
    body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
    body('images').optional().isArray(),
    body('tags').optional().isArray(),
    body('priceLevel').optional().isInt({ min: 1, max: 4 }),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano.'),
  ],
  validateRequest,
  localTourismController.updatePlace
);

router.delete(
  '/places/:id',
  protect,
  authorize('administrador'),
  [param('id').isMongoId().withMessage('Identificador de lugar inválido.')],
  validateRequest,
  localTourismController.deletePlace
);

router.post(
  '/places/:id/images',
  protect,
  authorize('administrador'),
  placesUpload.array('images', 10),
  [param('id').isMongoId().withMessage('Identificador de lugar inválido.')],
  validateRequest,
  localTourismController.addPlaceImages
);

router.delete(
  '/places/:id/images',
  protect,
  authorize('administrador'),
  [
    param('id').isMongoId().withMessage('Identificador de lugar inválido.'),
    body('imageUrl').notEmpty().withMessage('Se requiere "imageUrl".'),
  ],
  validateRequest,
  localTourismController.removePlaceImage
);

module.exports = router;
