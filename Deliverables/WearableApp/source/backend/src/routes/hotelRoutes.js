/**
 * routes/hotelRoutes.js
 * -----------------------------------------------------------------------
 * CRUD de hoteles: lectura pública, escritura restringida a administradores.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const hotelController = require('../controllers/hotelController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { hotelsUpload } = require('../utils/upload');

const roomValidator = body('rooms')
  .optional()
  .isArray()
  .withMessage('rooms debe ser un arreglo de habitaciones.');

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  hotelController.listHotels
);

router.get(
  '/nearby',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida.'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida.'),
    query('radius').optional().isInt({ min: 100, max: 50000 }),
  ],
  validateRequest,
  hotelController.getNearbyHotels
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Identificador de hotel inválido.')],
  validateRequest,
  hotelController.getHotelById
);

router.post(
  '/',
  protect,
  authorize('administrador'),
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('address').optional().trim().isString(),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    body('amenities').optional().isArray(),
    roomValidator,
    body('rooms.*.name').optional().isString().notEmpty(),
    body('rooms.*.pricePerNight').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  hotelController.createHotel
);

router.put(
  '/:id',
  protect,
  authorize('administrador'),
  [param('id').isMongoId().withMessage('Identificador de hotel inválido.'), roomValidator],
  validateRequest,
  hotelController.updateHotel
);

router.delete(
  '/:id',
  protect,
  authorize('administrador'),
  [param('id').isMongoId().withMessage('Identificador de hotel inválido.')],
  validateRequest,
  hotelController.deleteHotel
);

router.post(
  '/:id/images',
  protect,
  authorize('administrador'),
  hotelsUpload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'mainImage', maxCount: 1 },
  ]),
  [param('id').isMongoId().withMessage('Identificador de hotel inválido.')],
  validateRequest,
  hotelController.addHotelImages
);

module.exports = router;
