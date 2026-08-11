/**
 * routes/userRoutes.js
 * -----------------------------------------------------------------------
 * Administración de usuarios (Panel de Admin). Todas las rutas requieren
 * sesión y rol "administrador".
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.use(protect, authorize('administrador'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['usuario', 'administrador']),
    query('isActive').optional().isBoolean(),
    query('search').optional().isString(),
  ],
  validateRequest,
  userController.listUsers
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Identificador de usuario inválido.')],
  validateRequest,
  userController.getUserById
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Identificador de usuario inválido.'),
    body('fullName').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
    body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
    body('location').optional({ nullable: true }).trim().isLength({ max: 150 }),
    body('bio').optional({ nullable: true }).trim().isLength({ max: 300 }),
    body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }),
    body('role').optional().isIn(['usuario', 'administrador']).withMessage('Rol inválido.'),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano.'),
  ],
  validateRequest,
  userController.updateUser
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('Identificador de usuario inválido.')],
  validateRequest,
  userController.deleteUser
);

module.exports = router;
